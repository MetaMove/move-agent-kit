import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"
import { AGENT_CLIENT_MODE } from "../../constants"
import { parseJson } from "../../utils"

export class MerkleTradeClosePositionTool extends Tool {
	name = "merkle_trade_close_position"
	description = `this tool can be used to close position on MerkleTrade

  if you want to close a position, pair will be "BTC_USD" and isLong will be true
  
	Inputs ( input is a JSON string ):
	pair: string, eg "BTC_USD" (required)
	isLong: boolean, eg true (required)
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

			const txhash = await this.agent.closePositionWithMerkleTrade(parsedInput.pair, parsedInput.isLong)

			return JSON.stringify({
				status: "success",
				closePositionTransactionHash: txhash,
				position: {
					pair: parsedInput.pair,
					isLong: parsedInput.isLong,
					sizeDelta: parsedInput.sizeDelta,
					collateralDelta: parsedInput.collateralDelta,
					price: parsedInput.price,
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
