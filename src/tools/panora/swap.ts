import type { AgentRuntime } from "../../agent"
import { getSwapDetails } from "../../utils/get-swap-detail-panora"

/**
 * Swap tokens in panora
 * @param agent MoveAgentKit instance
 * @param fromToken Address of the token to swap from
 * @param toToken Address of the token to swap to
 * @param swapAmount Amount of tokens to swap
 * @param minCoinOut Minimum amount of tokens to receive (default 0)
 * @returns Transaction signature
 */
export async function swapWithPanora(
	agent: AgentRuntime,
	fromToken: string,
	toToken: string,
	swapAmount: number,
	toWalletAddress?: string,
	validateSkipFees?: (agent: AgentRuntime, account: string) => Promise<boolean>
): Promise<string> {
	try {
		const response = await getSwapDetails(
			agent,
			fromToken,
			toToken,
			swapAmount,
			toWalletAddress || agent.account.getAddress().toString(),
			validateSkipFees
		)

		if (response.quotes.length <= 0) {
			throw new Error("no quotes available from panora")
		}

		const transactionData = response.quotes[0].txData

		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function: transactionData.function,
				typeArguments: transactionData.type_arguments,
				functionArguments: transactionData.arguments,
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Swap failed")
			throw new Error("Swap tx failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Swap failed: ${error.message}`)
	}
}
