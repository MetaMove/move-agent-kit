import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class JouleCloseLoopTool extends Tool {
	name = "joule_close_loop"
	description = `this tool can be used to close loop positions of APT and stAPT
  
  Inputs ( input is a JSON string ):
  positionId: number, eg 1 (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const loopTransaction = await this.agent.closeLoop(
				parsedInput.positionId
			)

			return JSON.stringify({
				status: "success",
				loopTransaction
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
