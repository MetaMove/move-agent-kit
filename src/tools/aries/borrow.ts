import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Borrow tokens from Aries
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to borrow
 * @param amount Amount to borrow
 * @returns Transaction signature
 */
export async function borrowAriesToken(agent: AgentRuntime, mintType: MoveStructId, amount: number): Promise<string> {
	try {
		const transaction = await agent.aptos.transaction.build.simple({
			sender: agent.account.getAddress().toString(),
			data: {
				function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::withdraw",
				typeArguments: [mintType],
				functionArguments: ["Main account", amount, true],
			},
		})

		const committedTransactionHash = await agent.account.sendTransaction(transaction)

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Borrow failed")
			throw new Error("Borrow failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Borrow failed: ${error.message}`)
	}
}
