import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"
import { getTokenByTokenName } from "../../utils/get-pool-address-by-token-name"
import { parseFungibleAssetAddressToWrappedAssetAddress } from "../../utils/parse-fungible-asset-to-wrapped-asset"

export class LiquidSwapSwapTool extends Tool {
	name = "liquidswap_swap"
	description = `this tool can be used to swap tokens in liquidswap

want to swap APT and one of the token, mint is 0x1::aptos_coin::AptosCoin
one of the token is USDT, use 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT

Popular tokens you can swap include:
- Default tokens: APT, USDT, USDC
- Additional popular tokens: CASH, HAIR, EDOG, GUI, LOON, CELL, MGPT, UPTOS, CHEWY, BAPTMAN, MOOMOO, VIBE, etc.

if user added mintX or mintY as asset name, and you don't have the address of the asset, use these token names:
usdt,zusdt,zusdc,apt,sthapt,mod,thl,wusdc,zweth,wweth,cake,stapt,abtc,stone,truapt,sbtc,cash,hair,edog,gui,loon,cell,mgpt,uptos,chewy,baptman,moomoo,vibe
or whatever name the user has provided, you can use the token name to get the address of the token 

cant swap any fungible tokens. only coin standard swap allowed. if user trying to swap fungible token, ask it to swap via panora.

coin standard format : string::string::string

Examples:
- "Swap 0.1 APT for USDC"
- "I want to swap 5 HAIR for EDOG"
- "Exchange 10 CASH for GUI tokens"
- "Swap 2 BAPTMAN for MOOMOO tokens"

Inputs (input is a JSON string):
mintX: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" or "usdt (name of the token)" (required)
mintY: string, eg (same as mintX) (required)
swapAmount: number, eg 1 or 0.01 (required)
minCoinOut: number, eg 1 or 0.01 (optional)`

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string) {
		try {
			const parsedInput = parseJson(input)

			if (AGENT_CLIENT_MODE) {
				return {
					name: this.name,
					args: Object.values(parsedInput),
					onchain: true,
				}
			}

			let mintX = parsedInput.mintX
			const tokenX = getTokenByTokenName(mintX)
			if (tokenX) {
				mintX = tokenX.tokenAddress
			}

			let mintY = parsedInput.mintY
			const tokenY = getTokenByTokenName(mintY)
			if (tokenY) {
				mintY = tokenY.tokenAddress
			}

			const mintXDetail = await this.agent.getTokenDetails(mintX)

			const mintYDetail = await this.agent.getTokenDetails(mintY)

			const swapTransactionHash = await this.agent.swap(
				mintX,
				mintY,
				convertAmountFromHumanReadableToOnChain(parsedInput.swapAmount, mintXDetail.decimals),
				convertAmountFromHumanReadableToOnChain(parsedInput.minCoinOut, mintXDetail.decimals) || 0
			)

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
			})
		} catch (error: any) {
			return JSON.stringify({
				status: "error",
				message: error.message,
				code: error.code || "UNKNOWN_ERROR",
			})
		}
	}
}
