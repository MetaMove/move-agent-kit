import { AccountAddress } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class EmojicoinGetMarketTool extends Tool {
	name = "emojicoin_get_market"
	description = `Get the market data from Emojicoin

  - Each element needs to be emoji and only one emoji per element.

  Inputs ( input is a JSON string ):
    emojis: string[] string[] eg ["🚀", "🌛"] (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

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
