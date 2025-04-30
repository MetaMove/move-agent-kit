import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class EmojicoinProvideLiquidityTool extends Tool {
	name = "emojicoin_provide_liquidity"
	description = `Add liquidity for Emojicoins

  - Each element needs to be emoji and only one emoji per element.

  Inputs ( input is a JSON string ):
  emojis: string[] eg ["🚀", "🌛"] (required)
  amount: number, eg 1 or 0.01 (required)
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

			const amount = convertAmountFromHumanReadableToOnChain(parsedInput.amount, 8)

			const provideLiqudityEmojicoinTransactionHash = await this.agent.provideLiquidityEmojicoin(
				parsedInput.emojis,
				amount
			)

			return JSON.stringify({
				status: "success",
				provideLiqudityEmojicoinTransactionHash,
				emojis: parsedInput.emojis,
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
