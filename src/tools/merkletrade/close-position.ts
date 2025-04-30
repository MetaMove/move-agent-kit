import { MerkleClient, MerkleClientConfig } from "@merkletrade/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { FailedSendTransactionError, MerkleBaseError, PositionNotFoundError } from "./error"

/**
 * Close position on MerkleTrade
 * @param agent MoveAgentKit instance
 * @param pair Pair ID, e.g. "BTC_USD"
 * @param isLong True for long, false for short
 * @returns Transaction signature
 */
export async function closePositionWithMerkleTrade(agent: AgentRuntime, pair: string, isLong: boolean) {
	try {
		const merkle = new MerkleClient(await MerkleClientConfig.mainnet())

		const positions = await merkle.getPositions({
			address: agent.account.getAddress().toString(),
		})

		const position = positions.find((position) => position.pairType === pair && position.isLong === isLong)
		if (!position) {
			throw new PositionNotFoundError(pair, isLong, "Position not found")
		}

		const payload = merkle.payloads.placeMarketOrder({
			pair: pair,
			userAddress: agent.account.getAddress().toString(),
			sizeDelta: position.size,
			collateralDelta: position.collateral,
			isLong: position.isLong,
			isIncrease: false,
		})

		const txhash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: payload,
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: txhash,
		})

		if (!signedTransaction.success) {
			throw new FailedSendTransactionError("Close position failed", signedTransaction)
		}

		return signedTransaction.hash
	} catch (error: any) {
		if (error instanceof MerkleBaseError) {
			throw error
		}
		throw new Error(`Close position failed: ${error.message}`)
	}
}
