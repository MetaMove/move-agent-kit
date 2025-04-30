import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class EmojicoinSwapTool extends Tool {
	name = "emojicoin_swap"
	description = `swap emojicoins to APT or vice versa.

  - If user wants to swap 1 emoji to APT, set isSelling to true. If user wants to swap 1 APT to emoji, set isSelling to false.
  - Each element needs to be emoji and only one emoji per element.

  Inputs ( input is a JSON string ):
  emojis: string[] eg ["🚀", "🌛"] (required)
  amount: number, eg 1 or 0.01 (required)
  isSelling: boolean (required)
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

			const swapEmojicoinsTransactionHash = await this.agent.swapEmojicoins(
				parsedInput.emojis,
				amount,
				parsedInput.isSelling
			)

			return JSON.stringify({
				status: "success",
				swapEmojicoinsTransactionHash,
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
