import { type SymbolEmoji, getMarketAddress } from "@econia-labs/emojicoin-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Provide liquidity for emojis coins
 * @param agent MoveAgentKit instance
 * @param emojis Emojicoin to provide liquidity
 * @param amount Amount of emojis to provide liquidity
 * @example
 * ```ts
 * const transaction = await provideLiquidityEmojicoins(agent, emojis, amount);
 * ```
 */
export async function provideLiquidityEmojicoin(
	agent: AgentRuntime,
	emojis: SymbolEmoji[],
	amount: number
): Promise<{ hash: string }> {
	try {
		const marketAddress = getMarketAddress(emojis).toString()

		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function:
					"0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe::emojicoin_dot_fun::provide_liquidity",
				typeArguments: [`${marketAddress}::coin_factory::Emojicoin`, `${marketAddress}::coin_factory::EmojicoinLP`],
				functionArguments: [marketAddress.toString(), amount, 1],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction) {
			throw new Error("Failed to provide liquidity emojicoins")
		}

		return {
			hash: signedTransaction.hash,
		}
	} catch (error: any) {
		throw new Error(`Failed to provide liquidity: ${error.message}`)
	}
}
