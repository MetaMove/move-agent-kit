import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class AptosGetTokenPriceTool extends Tool {
	name = "aptos_token_price"
	description = `Get the live price of any aptos tokens in USD.
	do not do any decimals conversion here, the price is already in USD

  details also include decimals which you can use to make onchain values readable to a human user

  Inputs ( input is a JSON string - this is IMPORTANT):
  token: string, eg usdt, btc etc.`

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string) {
		console.log("input", input)
		try {
			const parsedInput = parseJson(input)

			if (AGENT_CLIENT_MODE) {
				return {
					name: this.name,
					args: Object.values(parsedInput),
					onchain: true,
				}
			}

			const token = parsedInput.token || input || "usdt"

			const tokenData = await this.agent.getTokenPrice(token)

			return JSON.stringify({
				status: "success",
				tokenData,
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
