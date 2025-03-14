import { AccountAddress, convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class AmnisStakeTool extends Tool {
	name = "amnis_stake"
	description = `this tool can be used to stake APT (Aptos) to amnis validator and receive its liquid staking token stAPT (staked APT)

	keep recipient blank if user themselves wants to receive stAPT and not send to anybody else

  Inputs ( input is a JSON string ) (required):
  amount: number, eg 1 or 0.01 (required)
  recipient: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (optional)`

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const recipient = AccountAddress.from(parsedInput.recipient) || this.agent.account.getAddress().toString()

			const stakeTransactionHash = await this.agent.stakeTokensWithAmnis(
				recipient,
				convertAmountFromHumanReadableToOnChain(parsedInput.amount, 8)
			)

			return JSON.stringify({
				status: "success",
				stakeTransactionHash,
				token: {
					name: "stAPT",
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
