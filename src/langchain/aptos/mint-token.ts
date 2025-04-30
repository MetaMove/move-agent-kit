import { AccountAddress } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class AptosMintTokenTool extends Tool {
	name = "aptos_mint_token"
	description = `this tool can be used to create fungible asset to a recipient

if the recipient wants to receive the token and not send to anybody else, keep to blank

  Inputs ( input is a JSON string ):
  to: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)
  amount: number, eg 1 or 0.01 (required)
  mint: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)
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

			const mintDetail = await this.agent.getTokenDetails(parsedInput.mint)

			const recipient = AccountAddress.from(parsedInput.to) || this.agent.account.getAddress().toString()
			const mintTokenTransactionHash = await this.agent.mintToken(recipient, parsedInput.mint, parsedInput.amount)

			return JSON.stringify({
				status: "success",
				mintTokenTransactionHash,
				token: {
					name: mintDetail.name || "APT",
					decimals: 8,
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
