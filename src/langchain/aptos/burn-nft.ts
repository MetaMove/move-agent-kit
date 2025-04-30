import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class AptosBurnNFTTool extends Tool {
	name = "aptos_burn_nft"
	description = `this tool can be used to burn any NFT on aptos

  Inputs ( input is a JSON string ):
  mint: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" (required)`

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string) {
		try {
			const parsedInput = parseJson(input)

			if (AGENT_CLIENT_MODE) {
				return {
					name: this.name,
					args: Object.values(parsedInput)?.length ? Object.values(parsedInput) : [input],
					onchain: true,
				}
			}

			const transfer = await this.agent.burnNFT(parsedInput.mint)

			return JSON.stringify({
				status: "success",
				transfer,
				nft: parsedInput.mint,
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
