import type { AccountAddress } from "@aptos-labs/ts-sdk"
import { type SymbolEmoji, getMarketAddress } from "@econia-labs/emojicoin-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Get history of emojicoin market
 * @param agent MoveAgentKit instance
 * @param emojis Emojis
 * @returns Position details
 * @example
 * ```ts
 * const market = await getMarket(agent, emojis);
 * ```
 */
export async function getMarketEmojicoin(agent: AgentRuntime, emojis: SymbolEmoji[]): Promise<any> {
	try {
		const marketAddress = getMarketAddress(emojis).toString()

		const transaction = await agent.aptos.view({
			payload: {
				function: "0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe::emojicoin_dot_fun::market_view",
				typeArguments: [`${marketAddress}::coin_factory::Emojicoin`, `${marketAddress}::coin_factory::EmojicoinLP`],
				functionArguments: [marketAddress],
			},
		})

		if (!transaction) {
			throw new Error("Failed to fetch user position")
		}

		return transaction
	} catch (error: any) {
		throw new Error(`Failed to get user position: ${error.message}`)
	}
}
