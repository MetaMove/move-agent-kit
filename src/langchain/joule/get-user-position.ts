import { AccountAddress } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class JouleGetUserPosition extends Tool {
	name = "joule_get_user_position"
	description = `the tool can be used to get details about a user's position

	keep userAddress blank if user wants to get their own position or didn't provide any other user's address

	ask user to provide positionId from the list of positions they have if they want to get details about a specific position.
	do not fill random positionId if the user didn't provide any positionId

  Inputs ( input is a JSON string ):
     userAddress: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (optional)
     positionId: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const userAddress = AccountAddress.from(parsedInput.userAddress) || this.agent.account.getAddress().toString()

			const jouleUserPosition = await this.agent.getUserPosition(userAddress, parsedInput.positionId)

			return JSON.stringify({
				status: "success",
				jouleUserPosition,
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
