import type { InputGenerateTransactionPayloadData, MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Withdraw tokens from Echelon
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to lend
 * @param amount Amount to lend
 * @param poolAddress Pool address
 * @param fungibleAsset Whether the asset is fungible
 * @returns Transaction signature
 */
export async function withdrawTokenWithEchelon(
	agent: AgentRuntime,
	mintType: MoveStructId,
	amount: number,
	poolAddress: string,
	fungibleAsset: boolean
): Promise<string> {
	try {
		const FUNCTIONAL_ARGS_DATA = [poolAddress, amount]

		const COIN_STANDARD_DATA: InputGenerateTransactionPayloadData = {
			function: "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::scripts::withdraw",
			typeArguments: [mintType.toString()],
			functionArguments: FUNCTIONAL_ARGS_DATA,
		}

		const FUNGIBLE_ASSET_DATA: InputGenerateTransactionPayloadData = {
			function: "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::scripts::withdraw_fa",
			functionArguments: FUNCTIONAL_ARGS_DATA,
		}

		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: fungibleAsset ? FUNGIBLE_ASSET_DATA : COIN_STANDARD_DATA,
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Withdraw failed")
			throw new Error("Withdraw failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Withdraw failed: ${error.message}`)
	}
}
