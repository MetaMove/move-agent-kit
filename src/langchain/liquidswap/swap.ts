import { Tool } from "langchain/tools";
import { AgentRuntime, parseJson } from "../..";
import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk";
import { parseFungibleAssetAddressToWrappedAssetAddress } from "../../utils/parse-fungible-asset-to-wrapped-asset";

export class LiquidSwapSwapTool extends Tool {
	name = "liquidswap_swap";
	description = `this tool can be used to swap tokens in liquidswap

    if you want to swap APT and one of the token, mint will be "0x1::aptos_coin::AptosCoin"
	if one of the token is USDT, use "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT"
	
	cant swap any fungible tokens. only coin standard swap allowed. if user trying to swap fungible token, ask it to swap via panora.

	coin standard format : string::string::string

    Inputs ( input is a JSON string ):
    mintX: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" (required)
    mintY: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" (required)
    swapAmount: number, eg 1 or 0.01 (required)
    minCoinOut: number, eg 1 or 0.01 (optional)
    `;

	constructor(private agent: AgentRuntime) {
		super();
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input);

			const mintXDetail = await this.agent.getTokenDetails(
				parsedInput.mintX,
			);

			const mintYDetail = await this.agent.getTokenDetails(
				parsedInput.mintY,
			);

			const swapTransactionHash = await this.agent.swap(
				parsedInput.mintX,
				parsedInput.mintY,
				convertAmountFromHumanReadableToOnChain(
					parsedInput.swapAmount,
					mintXDetail.decimals,
				),
				convertAmountFromHumanReadableToOnChain(
					parsedInput.minCoinOut,
					mintXDetail.decimals,
				) || 0,
			);

			return JSON.stringify({
				status: "success",
				swapTransactionHash,
				token: [
					{
						mintX: mintXDetail.name,
						decimals: mintXDetail.decimals,
					},
					{
						mintY: mintYDetail.name,
						decimals: mintYDetail.decimals,
					},
				],
			});
		} catch (error: any) {
			return JSON.stringify({
				status: "error",
				message: error.message,
				code: error.code || "UNKNOWN_ERROR",
			});
		}
	}
}