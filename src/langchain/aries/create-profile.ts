import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class AriesCreateProfileTool extends Tool {
	name = "aries_create_profile"
	description = `this tool can be used to create a profile in Aries
    `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call() {
		try {
			if (AGENT_CLIENT_MODE) {
				return {
					name: this.name,
					args: [],
					onchain: true,
				}
			}

			const createProfileTransactionHash = await this.agent.createAriesProfile()

			return JSON.stringify({
				status: "success",
				createProfileTransactionHash,
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
