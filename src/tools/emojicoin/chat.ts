import { type SymbolEmoji, getMarketAddress, toChatMessageEntryFunctionArgs } from "@econia-labs/emojicoin-sdk"
import type { AgentRuntime } from "../../agent"
/**
 * Write a message with emojis on chat
 * @param agent MoveAgentKit instance
 * @param emojis Emoji coin to message
 * @example
 * ```ts
 * const metadata = await getMarketMetadataByBytes(agent, emojibyBytes);
 * ```
 */
export async function chatEmojicoin(agent: AgentRuntime, message: string): Promise<{ hash: string }> {
	try {
		const { emojiBytes, emojiIndicesSequence } = toChatMessageEntryFunctionArgs(message)

		const emojis = message.split("") as SymbolEmoji[]

		const marketAddress = getMarketAddress(emojis).toString()

		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function: "0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe::emojicoin_dot_fun::chat",
				typeArguments: [`${marketAddress}::coin_factory::Emojicoin`, `${marketAddress}::coin_factory::EmojicoinLP`],
				functionArguments: [marketAddress, emojiBytes, new Uint8Array(emojiIndicesSequence)],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction) {
			throw new Error("Failed to get market metadata")
		}

		return {
			hash: signedTransaction.hash,
		}
	} catch (error: any) {
		throw new Error(`Failed to get market metadata: ${error.message}`)
	}
}
