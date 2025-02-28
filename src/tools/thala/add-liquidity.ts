import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Add liquidity to Thala pool
 * @param agent MoveAgentKit instance
 * @param mintTypeX First coin type
 * @param mintTypeY Second coin type
 * @param mintXAmount Amount of first coin
 * @param mintYAmount Amount of second coin
 * @returns Transaction signature
 */
export async function addLiquidityWithThala(
	agent: AgentRuntime,
	mintTypeX: MoveStructId,
	mintTypeY: MoveStructId,
	mintXAmount: number,
	mintYAmount: number
): Promise<string> {
	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: {
				function:
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool_scripts::add_liquidity",
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
				functionArguments: [mintXAmount, mintYAmount, 0, 0, 0, 0, 0, 0],
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
		throw new Error(`Add liquidity failed: ${error.message}`)
	}
}
