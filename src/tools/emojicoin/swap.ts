import { INTEGRATOR_ADDRESS, type SymbolEmoji, getMarketAddress } from "@econia-labs/emojicoin-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Swap emojis coins
 * @param agent MoveAgentKit instance
 * @param emojis Emojicoin to swap
 * @param amount Amount of emojis to swap
 * @param isSelling Whether to sell or buy
 * @example
 * ```ts
 * const transactionHash = await swapEmojicoins(agent, emojis, amount, isSelling);
 * ```
 */
export async function swapEmojicoins(
	agent: AgentRuntime,
	emojis: SymbolEmoji[],
	amount: number,
	isSelling: boolean,
	validateSkipFees?: (agent: AgentRuntime, account: string) => Promise<boolean>
): Promise<{ hash: string }> {
	try {
		let skipFees = false

		if (validateSkipFees) {
			skipFees = await validateSkipFees(agent, agent.account.getAddress().toString())
		}

		const marketAddress = getMarketAddress(emojis).toString()

		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function: "0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe::emojicoin_dot_fun::swap",
				typeArguments: [`${marketAddress}::coin_factory::Emojicoin`, `${marketAddress}::coin_factory::EmojicoinLP`],
				functionArguments: [
					marketAddress.toString(),
					amount,
					isSelling,
					process.env.EMOJI_INTEGRATOR || "0x3212ed354e3d5b17ed6e3f7e8fb3066325b54be80d61d0d5d01dbc23d95f34d5",
					skipFees ? 0 : process.env.EMOJI_FEES || 50,
					1,
				],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction) {
			throw new Error("Failed to swap emojicoins")
		}

		return {
			hash: signedTransaction.hash,
		}
	} catch (error: any) {
		throw new Error(`Failed to get market metadata: ${error.message}`)
	}
}
