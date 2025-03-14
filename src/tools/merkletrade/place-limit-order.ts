import { MerkleClient, MerkleClientConfig, fromNumber } from "@merkletrade/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { FailedSendTransactionError, MerkleBaseError } from "./error"

/**
 * Place limit order on MerkleTrade
 * @param agent MoveAgentKit instance
 * @param pair Pair ID, e.g. "BTC_USD"
 * @param isLong True for long, false for short
 * @param sizeDelta Amount of tokens to buy/sell (in USDC, 10 USDC = 10)
 * @param collateralDelta Amount of collateral to buy/sell (in USDC, 10 USDC = 10)
 * @param price Price of the order (in USD)
 * @returns Transaction signature
 */
export async function placeLimitOrderWithMerkleTrade(
	agent: AgentRuntime,
	pair: string,
	isLong: boolean,
	sizeDelta: number, // in USDC
	collateralDelta: number, // in USDC
	price: number // in USD
) {
	try {
		const merkle = new MerkleClient(await MerkleClientConfig.mainnet())

		const payload = merkle.payloads.placeLimitOrder({
			pair: pair,
			userAddress: agent.account.getAddress().toString(),
			sizeDelta: fromNumber(sizeDelta, 6),
			collateralDelta: fromNumber(collateralDelta, 6),
			price: fromNumber(price, 10),
			isLong: isLong,
			isIncrease: true,
		})

		const txhash = await agent.account.sendTransaction({
			sender: agent.account.getAddress().toString(),
			data: payload,
		})

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: txhash,
		})

		if (!signedTransaction.success) {
			throw new FailedSendTransactionError("Place limit order failed", signedTransaction)
		}

		return signedTransaction.hash
	} catch (error: any) {
		if (error instanceof MerkleBaseError) {
			throw error
		}
		throw new Error(`Place market order failed: ${error.message}`)
	}
}
