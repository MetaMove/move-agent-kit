import { callPanoraApi } from "../../utils/call-panora-api"
import type { AgentRuntime } from "../../agent"

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
	toWalletAddress?: string
): Promise<string> {
	try {
		const transactionData = await callPanoraApi(agent, fromToken, toToken, swapAmount, toWalletAddress)

		const transaction = await agent.aptos.transaction.build.simple({
			sender: agent.account.getAddress(),
			data: {
				function: transactionData.function,
				typeArguments: transactionData.type_arguments,
				functionArguments: transactionData.arguments,
			},
		})

		const committedTransactionHash = await agent.account.sendTransaction(transaction)

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
