import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class EmojicoinChatTool extends Tool {
	name = "emojicoin_chat"
	description = `write a message in Emojicoin chat
  - Only emojis are allowed in message and need to match with emojis array parameter as if it is converted in UTF-8 HEX format and position of element
  
  Inputs ( input is a JSON string ):
  message: string here only emojis eg 🚀🌛 (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const emojicoinChatTransactionHash = await this.agent.chatEmojicoin(parsedInput.message)

			return JSON.stringify({
				status: "success",
				emojicoinChatTransactionHash,
				chat: {
					emoji: parsedInput.emojis,
					message: parsedInput.message,
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
