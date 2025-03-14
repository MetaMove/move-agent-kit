import { AccountAddress } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { tokensList } from "../../utils/get-pool-address-by-token-name"

export class JouleGetUserAllPositions extends Tool {
	name = "joule_get_user_all_positions"
	description = `the tool can be used to get details about a user's all positions

	keep userAddress blank if user wants to get their own position or didn't provide any other user's address

  Inputs ( input is a JSON string ):
     userAddress: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (optional)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const userAddress = AccountAddress.from(parsedInput.userAddress) || this.agent.account.getAddress().toString()

			const jouleUserAllPositions = await this.agent.getUserAllPositions(userAddress)

			return JSON.stringify({
				status: "success",
				jouleUserAllPositions,
				tokens: tokensList.map((token) => {
					return {
						name: token.name,
						decimals: token.decimals,
						tokenAddress: token.tokenAddress,
					}
				}),
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
