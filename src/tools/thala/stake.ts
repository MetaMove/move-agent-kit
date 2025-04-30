import type { AgentRuntime } from "../../agent"

/**
 * Stake tokens in Thala
 * @param agent MoveAgentKit instance
 * @param amount Amount of token to stake
 * @returns Transaction signature
 */
export async function stakeTokenWithThala(agent: AgentRuntime, amount: number): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function: "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::scripts::stake_APT_and_thAPT",
				functionArguments: [amount],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Stake APT failed")
			throw new Error("Stake APT failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Stake APT failed: ${error.message}`)
	}
}
