import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

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
