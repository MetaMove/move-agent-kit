import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"
import { AGENT_CLIENT_MODE } from "../../constants"

export class MerkleTradeGetPositionTool extends Tool {
	name = "merkle_trade_get_position"
	description = `this tool can be used to get position on MerkleTrade
    No inputs required, this tool will return the current position of the agent
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

			const position = await this.agent.getPositionsWithMerkleTrade()

			return JSON.stringify({
				status: "success",
				position: position,
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
