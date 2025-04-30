import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class AptosAccountAddressTool extends Tool {
	name = "aptos_get_wallet_address"
	description = "Get the wallet address of the agent"

	constructor(private agent: AgentRuntime) {
		super()
	}

	async _call(_input: string) {
		if (AGENT_CLIENT_MODE) {
			return {
				name: this.name,
				args: [],
				onchain: true,
			}
		}

		return this.agent.account.getAddress().toString()
	}
}
