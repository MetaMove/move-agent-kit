import type { AgentRuntime } from "../../agent"

/**
 * Unstake tokens in Echo
 * @param agent MoveAgentKit instance
 * @param amount Amount of APT to unstake
 * @returns Transaction signature
 */
export async function unstakeTokenWithEcho(agent: AgentRuntime, amount: number): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function: "0xa0281660ff6ca6c1b68b55fcb9b213c2276f90ad007ad27fd003cf2f3478e96e::lsdmanage::unstake",
				functionArguments: [amount],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Unstake token in Echo failed")
			throw new Error("Unstake token in Echo failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Unstake token in Echo failed: ${error.message}`)
	}
}
