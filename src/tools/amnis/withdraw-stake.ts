import type { AccountAddress } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Unstake APT or any tokens on Amnis
 * @param agent MoveAgentKit instance
 * @param to Recipient's public key
 * @param amount Amount to unstake
 * @returns Transaction signature
 */
export async function unstakeTokens(agent: AgentRuntime, to: AccountAddress, amount: number): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function: "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::router::unstake_entry",
				functionArguments: [amount, to.toString()],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token unstaking failed")
			throw new Error("Token unstaking failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Token unstaking failed: ${error.message}`)
	}
}
