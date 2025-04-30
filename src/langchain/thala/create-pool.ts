import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"
import { AGENT_CLIENT_MODE } from "../../constants"
import { parseJson } from "../../utils"

export class ThalaCreatePoolTool extends Tool {
	name = "thala_create_pool"
	description = `this tool can be used to create a new pool in Thala

    If you want to create a pool with APT, use "0x1::aptos_coin::AptosCoin" as the coin type
    For other coins use their respective addresses

    Fee tiers:
    - 1 for 0.01%
    - 5 for 0.05%
    - 30 for 0.3%
    - 100 for 1%

    Amplification factors: 10, 100, or 1000

    If the user did not provide any input for fee tiers or amplification, do not fill any fee tiers or amplification. 
    Ask the user to provide fee tiers and amplification.

    Inputs (input is a JSON string):
    mintX: string, eg "0x1::aptos_coin::AptosCoin" (required)
    mintY: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" (required)
    amountX: number, eg 1 or 0.01 (required)
    amountY: number, eg 1 or 0.01 (required)
    feeTier: number, eg 1, 5, 30, or 100 (required)
    amplificationFactor: number, eg 10, 100, or 1000 (required)
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

			const createPoolTransactionHash = await this.agent.createPoolWithThala(
				parsedInput.mintX,
				parsedInput.mintY,
				convertAmountFromHumanReadableToOnChain(parsedInput.amountX, mintXDetail.decimals),
				convertAmountFromHumanReadableToOnChain(parsedInput.amountY, mintYDetail.decimals),
				parsedInput.feeTier,
				parsedInput.amplificationFactor
			)

			return JSON.stringify({
				status: "success",
				createPoolTransactionHash,
				tokens: [
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
