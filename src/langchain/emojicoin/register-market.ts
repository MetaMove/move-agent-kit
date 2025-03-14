import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class EmojicoinRegisterMarketTool extends Tool {
	name = "emojicoin_register_market"
	description = `this tool can be used to register a market on Emojicoin

	- Each element needs to be emoji and only one emoji per element.

  Inputs ( input is a JSON string ):
  emojis: string[] eg ["🚀", "🌛"] (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const registerMarketEmojicoinTransactionHash = await this.agent.registerMarketEmojicoin(parsedInput.emojis)

			return JSON.stringify({
				status: "success",
				registerMarketEmojicoinTransactionHash,
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
