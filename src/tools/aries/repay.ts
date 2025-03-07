import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Repay tokens in Aries
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to repay
 * @param amount Amount to repay
 * @returns Transaction signature
 */
export async function repayAriesToken(agent: AgentRuntime, mintType: MoveStructId, amount: number): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::deposit",
				typeArguments: [mintType],
				functionArguments: ["Main account", amount, true],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Repay failed")
			throw new Error("Repay failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Repay failed: ${error.message}`)
	}
}
