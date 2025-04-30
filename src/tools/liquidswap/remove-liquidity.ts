import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Remove liquidity from liquidswap
 * @param agent MoveAgentKit instance
 * @param mintX MoveStructId of the first token
 * @param mintY MoveStructId of the second token
 * @param lpAmount Amount of Liquidity Provider tokens to remove
 * @param minMintX Minimum amount of first token to receive (default 0)
 * @param minMintY Minimum amount of second token to receive (default 0)
 * @returns Transaction signature
 */
export async function removeLiquidity(
	agent: AgentRuntime,
	mintX: MoveStructId,
	mintY: MoveStructId,
	lpAmount: number,
	minMintX = 0,
	minMintY = 0
): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function: "0x9dd974aea0f927ead664b9e1c295e4215bd441a9fb4e53e5ea0bf22f356c8a2b::router::remove_liquidity_v05",
				typeArguments: [
					mintX,
					mintY,
					"0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e::curves::Uncorrelated",
				],
				functionArguments: [lpAmount, minMintX, minMintY],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Remove liquidity failed")
			throw new Error("Remove liquidity failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Remove liquidity failed: ${error.message}`)
	}
}
