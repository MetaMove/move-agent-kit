import type { AgentRuntime } from "../../agent"

/**
 * Create a profile in Aries
 * @param agent MoveAgentKit instance
 * @returns Transaction signature
 */
export async function createAriesProfile(agent: AgentRuntime): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::register_user",
				functionArguments: ["Main account"],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Create profile failed")
			throw new Error("Create profile failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Create profile failed: ${error.message}`)
	}
}
