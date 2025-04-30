import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Remove liquidity from Thala pool
 * @param agent MoveAgentKit instance
 * @param mintTypeX First coin type
 * @param mintTypeY Second coin type
 * @param lpAmount Amount of LP tokens to remove
 * @returns Transaction signature
 */
export async function removeLiquidityWithThala(
	agent: AgentRuntime,
	mintTypeX: MoveStructId,
	mintTypeY: MoveStructId,
	lpAmount: number
): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function:
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool_scripts::remove_liquidity",
				typeArguments: [
					mintTypeX,
					mintTypeY,
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::Weight_50",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::Weight_50",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
				],
				functionArguments: [lpAmount, 0, 0, 0, 0],
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
