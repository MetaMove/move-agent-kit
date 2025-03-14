import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Lend tokens in Aries
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to lend
 * @param amount Amount to lend
 * @returns Transaction signature
 */
export async function lendAriesToken(agent: AgentRuntime, mintType: MoveStructId, amount: number): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::deposit",
				typeArguments: [mintType],
				functionArguments: ["Main account", amount, false],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Lend failed")
			throw new Error("Lend failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Lend failed: ${error.message}`)
	}
}
