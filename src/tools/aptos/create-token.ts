import type { AgentRuntime } from "../../agent"

/**
 * Create a fungible asset token
 * @param agent MoveAgentKit instance
 * @param name Name of the token
 * @param symbol Symbol of the token
 * @param iconURI URI of the token icon
 * @param projectURI URI of the token project
 */
export async function createToken(
	agent: AgentRuntime,
	name: string,
	symbol: string,
	iconURI: string,
	projectURI: string
): Promise<{
	hash: string
	token: any
}> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function: "0x67c8564aee3799e9ac669553fdef3a3828d4626f24786b6a5642152fa09469dd::launchpad::create_fa_simple",
				functionArguments: [name, symbol, iconURI, projectURI],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token creation failed")
			throw new Error("Token creation failed")
		}

		return {
			hash: signedTransaction.hash,
			// @ts-ignore
			token: signedTransaction.events[0].data.fa_obj.inner,
		}
	} catch (error: any) {
		throw new Error(`Token creation failed: ${error.message}`)
	}
}
