import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class AptosBurnTokenTool extends Tool {
	name = "aptos_burn_token"
	description = `this tool can be used to burn a fungible asset

  Inputs ( input is a JSON string ):
  amount: number, eg 1 or 0.01 (required) 
  mint: string, "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)`

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

			const mintDetail = await this.agent.getTokenDetails(parsedInput.mint)

			const burnTransactionHash = await this.agent.burnToken(
				convertAmountFromHumanReadableToOnChain(parsedInput.amount, mintDetail.decimals || 8),
				parsedInput.mint
			)

			return JSON.stringify({
				status: "success",
				burnTransactionHash,
				token: {
					name: mintDetail.name,
					decimals: mintDetail.decimals,
				},
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
