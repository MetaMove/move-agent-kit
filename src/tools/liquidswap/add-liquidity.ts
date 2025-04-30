import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Add liquidity in liquidswap
 * @param agent MoveAgentKit instance
 * @param mintX MoveStructId of the first token
 * @param mintY MoveStructId of the second token
 * @param mintXAmount Amount of the first token to add
 * @param mintYAmount Amount of the second token to add
 * @returns Transaction signature
 */
export async function addLiquidity(
	agent: AgentRuntime,
	mintX: MoveStructId,
	mintY: MoveStructId,
	mintXAmount: number,
	mintYAmount: number
): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function: "0x9dd974aea0f927ead664b9e1c295e4215bd441a9fb4e53e5ea0bf22f356c8a2b::router::add_liquidity_v05",
				typeArguments: [
					mintX,
					mintY,
					"0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e::curves::Uncorrelated",
				],
				functionArguments: [
					mintXAmount,
					0, //coin_x_min,
					mintYAmount,
					0, // coin_y_min
				],
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Add liquidity failed")
			throw new Error("Add liquidity failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		console.error(error, "Add liquidity failed")
		throw new Error(`Add liquidity failed: ${error.message}`)
	}
}
