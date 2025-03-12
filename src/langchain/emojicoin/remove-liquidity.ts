import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class EmojicoinRemoveLiquidityTool extends Tool {
	name = "emojicoin_remove_liquidity"
	description = `remove liquidity for Emojicoins

  - Each element needs to be emoji and only one emoji per element.

  Inputs ( input is a JSON string ):
  emojis: string[] eg ["🚀", "🌛"] (required)
  amount: number, eg 1 or 0.01 (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const amount = convertAmountFromHumanReadableToOnChain(parsedInput.amount, 8)

			const provideLiqudityEmojicoinTransactionHash = await this.agent.removeLiquidityEmojicoin(
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
