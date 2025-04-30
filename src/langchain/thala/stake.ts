import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class ThalaStakeTokenTool extends Tool {
	name = "thala_stake_token"
	description = `this tool can be used to stake thAPT in Thala

    Inputs ( input is a JSON string ):
    amount: number, eg 1 or 0.01 (required)
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

			const stakeTransactionHash = await this.agent.stakeTokensWithThala(
				convertAmountFromHumanReadableToOnChain(parsedInput.amount, 8)
			)

			return JSON.stringify({
				status: "success",
				stakeTransactionHash,
				token: {
					name: "thAPT",
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
