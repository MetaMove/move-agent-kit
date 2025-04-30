import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"
import { AGENT_CLIENT_MODE } from "../../constants"
import { parseJson } from "../../utils"

export class MerkleTradePlaceMarketOrderTool extends Tool {
	name = "merkle_trade_place_market_order"
	description = `this tool can be used to place market order on MerkleTrade

  if you want to place a market order to buy BTC, pair will be "BTC_USD" and isLong will be true, 
  if you want to place a market order to sell BTC, pair will be "BTC_USD" and isLong will be false
  if you want to place a market order to size 100, collateral 10, sizeDelta will be 100, collateralDelta will be 10

	Inputs ( input is a JSON string ):
	pair: string, eg "BTC_USD" (required)
	isLong: boolean, eg true (required)
	sizeDelta: number, eg 10 (required)
	collateralDelta: number, eg 10 (required)
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

			const txhash = await this.agent.placeMarketOrderWithMerkleTrade(
				parsedInput.pair,
				parsedInput.isLong,
				parsedInput.sizeDelta,
				parsedInput.collateralDelta
			)

			return JSON.stringify({
				status: "success",
				marketOrderTransactionHash: txhash,
				position: {
					pair: parsedInput.pair,
					isLong: parsedInput.isLong,
					sizeDelta: parsedInput.sizeDelta,
					collateralDelta: parsedInput.collateralDelta,
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
