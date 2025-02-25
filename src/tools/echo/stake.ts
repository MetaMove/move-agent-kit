import type { AgentRuntime } from "../../agent"

/**
 * Stake tokens in Echo
 * @param agent MoveAgentKit instance
 * @param amount Amount of token to stake
 * @returns Transaction signature
 */
export async function stakeTokenWithEcho(agent: AgentRuntime, amount: number): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function: "0xa0281660ff6ca6c1b68b55fcb9b213c2276f90ad007ad27fd003cf2f3478e96e::lsdmanage::stake",
				functionArguments: [amount],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Stake token in Echo failed")
			throw new Error("Stake token in Echo failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Stake token in Echo failed: ${error.message}`)
	}
}
