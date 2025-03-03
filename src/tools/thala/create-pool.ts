import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Create a new pool in Thala
 * @param agent MoveAgentKit instance
 * @param mintX First coin type or FA address
 * @param mintY Second coin type or FA address
 * @param amountX Amount of first coin
 * @param amountY Amount of second coin
 * @param options Pool creation options
 * @returns Transaction signature
 */

const NOTACOIN = "0x007730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5::coin_wrapper::Notacoin"
export async function createPoolWithThala(
	agent: AgentRuntime,
	mintX: MoveStructId | string,
	mintY: MoveStructId | string,
	amountX: number,
	amountY: number,
	feeTier: number,
	amplificationFactor: number
): Promise<string> {
	try {
		const isCoinX = mintX === "0x1::aptos_coin::AptosCoin" || mintX.includes("::")
		const isCoinY = mintY === "0x1::aptos_coin::AptosCoin" || mintY.includes("::")

		const functionArgs = [
			[isCoinX ? "0xa" : mintX, isCoinY ? "0xa" : mintY],
			[amountX, amountY],
			feeTier,
			amplificationFactor,
		]

		const typeArgs = [isCoinX ? mintX : NOTACOIN, isCoinY ? mintY : NOTACOIN, NOTACOIN, NOTACOIN, NOTACOIN, NOTACOIN]

		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: {
				function:
					"0x007730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5::coin_wrapper::create_pool_stable",
				typeArguments: typeArgs,
				functionArguments: functionArgs,
			},
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Create pool failed")
			throw new Error("Create pool failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Create pool failed: ${error.message}`)
	}
}
