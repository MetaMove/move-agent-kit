import { AccountAddress, type InputGenerateTransactionPayloadData, type MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Repay APT, tokens or fungible asset from a position
 * @param agent MoveAgentKit instance
 * @param amount Amount to mint
 * @param mint The Move struct ID of the token to repay
 * @param positionId The position ID to repay
 * @param fungibleAssetAddress The address of the fungible asset if the token is fungible (optional)
 * @returns Transaction signature and position ID
 * @example
 * ```ts
 * const transactionHash = await repayToken(agent, amount, APTOS_COIN, positionId); // For APT
 * const otherTransactionHash = await repayToken(agent, amount, OTHER_TOKEN, positionId); // For another token
 * const fungibleAssetTransactionHash = await repayToken(agent, amount, APTOS_COIN, positionId, fungibleAssetAddress); // For fungible asset
 */
export async function repayToken(
	agent: AgentRuntime,
	amount: number,
	mint: MoveStructId,
	positionId: string,
	fungibleAsset: boolean
): Promise<{
	hash: string
	positionId: string
}> {
	const DEFAULT_FUNCTIONAL_ARGS = [positionId, amount]

	const COIN_STANDARD_DATA: InputGenerateTransactionPayloadData = {
		function: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::repay",
		typeArguments: [mint.toString()],
		functionArguments: DEFAULT_FUNCTIONAL_ARGS,
	}

	const FUNGIBLE_ASSET_DATA: InputGenerateTransactionPayloadData = {
		function: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::repay_fa",
		functionArguments: [positionId, mint.toString(), amount],
	}

	try {
		const committedTransactionHash = await agent.account.sendTransaction({
			sender: agent.account.getAddress(),
			data: fungibleAsset ? FUNGIBLE_ASSET_DATA : COIN_STANDARD_DATA,
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token repay failed")
			throw new Error("Token repay failed")
		}

		return {
			hash: signedTransaction.hash,
			positionId,
		}
	} catch (error: any) {
		throw new Error(`Token repay failed: ${error.message}`)
	}
}
