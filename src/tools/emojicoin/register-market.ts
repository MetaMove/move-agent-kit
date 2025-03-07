import { INTEGRATOR_ADDRESS, RegisterMarket, type SymbolEmoji, toMarketEmojiData } from "@econia-labs/emojicoin-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Lend APT, tokens or fungible asset to a position
 * @param agent MoveAgentKit instance
 * @param emojis Emojis
 * @returns Transaction signature and position ID
 * @example
 * ```ts
 * const transactionHash = await registerMarketEmojicoin(agent, emojis);
 * ```
 */
export async function registerMarketEmojicoin(agent: AgentRuntime, emojis: SymbolEmoji[]): Promise<{ hash: string }> {
	const symbol = emojis.join("")

	const bytes = toMarketEmojiData(symbol).emojis.map((e) => e.bytes)

	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function:
					"0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe::emojicoin_dot_fun::register_market",
				typeArguments: [],
				functionArguments: [bytes, INTEGRATOR_ADDRESS.toString()],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		// check transaction receipt

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Market registration failed")
			throw new Error("Market registration failed")
		}

		return {
			hash: signedTransaction.hash,
		}
	} catch (error: any) {
		throw new Error(`Market registration failed: ${error.message}`)
	}
}
