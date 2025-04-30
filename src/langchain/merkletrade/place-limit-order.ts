import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"
import { AGENT_CLIENT_MODE } from "../../constants"
import { parseJson } from "../../utils"

export class MerkleTradePlaceLimitOrderTool extends Tool {
	name = "merkle_trade_place_limit_order"
	description = `this tool can be used to place limit order on MerkleTrade

  if you want to place a limit order to buy BTC at 100000, pair will be "BTC_USD" and isLong will be true, price will be 100000
  
	Inputs ( input is a JSON string ):
	pair: string, eg "BTC_USD" (required)
	isLong: boolean, eg true (required)
	sizeDelta: number, eg 10 (required)
	collateralDelta: number, eg 10 (required)
	price: number, eg 10000 (required)
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

			const txhash = await this.agent.placeLimitOrderWithMerkleTrade(
				parsedInput.pair,
				parsedInput.isLong,
				parsedInput.sizeDelta,
				parsedInput.collateralDelta,
				parsedInput.price
			)

			return JSON.stringify({
				status: "success",
				limitOrderTransactionHash: txhash,
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
