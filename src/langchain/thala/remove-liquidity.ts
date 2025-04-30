import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"
import { AGENT_CLIENT_MODE } from "../../constants"
import { parseJson } from "../../utils"

export class ThalaRemoveLiquidityTool extends Tool {
	name = "thala_remove_liquidity"
	description = `this tool can be used to remove liquidity from a Thala pool

    If one of your coins is APT, use "0x1::aptos_coin::AptosCoin" as the coin type

    Inputs ( input is a JSON string ):
    mintX: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" (required)
    mintY: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" (required)
    lpAmount: number, eg 1 or 0.01 (required)
    `

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

			const mintXDetail = await this.agent.getTokenDetails(parsedInput.mintX)

			const mintYDetail = await this.agent.getTokenDetails(parsedInput.mintY)

			const removeLiquidityTransactionHash = await this.agent.removeLiquidityWithThala(
				parsedInput.mintX,
				parsedInput.mintY,
				convertAmountFromHumanReadableToOnChain(parsedInput.lpAmount, 6)
			)

			return JSON.stringify({
				status: "success",
				removeLiquidityTransactionHash,
				tokens: [
					{
						mintX: mintXDetail.name,
						decimals: 6,
					},
					{
						mintY: mintYDetail.name,
						decimals: 6,
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
