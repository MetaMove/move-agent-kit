import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class GetWormholeSupportedChainsTool extends Tool {
	name = "get_wormhole_supported_chains"
	description = "This tool can be used to get the list of supported chains by Wormhole"

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		const result = await this.agent.getSupportedWormholeChains()
		return JSON.stringify(result)
	}
}