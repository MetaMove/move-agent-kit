import axios from "axios"
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
		const panoraParameters = {
			fromTokenAddress: fromToken,
			toTokenAddress: toToken,
			fromTokenAmount: swapAmount.toString(),
			toWalletAddress: toWalletAddress ? toWalletAddress : agent.account.getAddress().toString(),
		}

		const url = `https://api.panora.exchange/swap?${new URLSearchParams(panoraParameters).toString()}`

		const panoraApiKey = agent.config.PANORA_API_KEY
		if (!panoraApiKey) {
			throw new Error("No PANORA_API_KEY in config")
		}

		const res = await axios.post(
			url,
			{},
			{
				headers: {
					"x-api-key": panoraApiKey,
				},
			}
		)
		const response = await res.data

		if (response.quotes.length <= 0) {
			throw new Error("no quotes available from panora")
		}

		const transactionData = response.quotes[0].txData

		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
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
