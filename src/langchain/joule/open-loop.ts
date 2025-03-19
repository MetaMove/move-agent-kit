import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class JouleOpenLoopTool extends Tool {
	name = "joule_open_loop"
	description = `this tool can be used to open loop APT and stAPT with a leverage to earn multipled yields

  This only supports looping between APT and stAPT
  
  Inputs ( input is a JSON string ):
  amount: number, eg 1 or 0.01 (required)
  leverage: number, eg 1 or 0.01 (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const loopTransaction = await this.agent.openLoop(
				convertAmountFromHumanReadableToOnChain(parsedInput.amount, 8),
				parsedInput.leverage
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
