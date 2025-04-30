import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class EmojicoinGetMarketTool extends Tool {
	name = "emojicoin_get_market"
	description = `Get the market data from Emojicoin

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

			const marketView = await this.agent.getMarketEmojicoin(parsedInput.emojis)

			return JSON.stringify({
				status: "success",
				marketView,
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
