import { AccountAddress, type InputGenerateTransactionPayloadData, type MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { callPanoraApi } from "../../utils/call-panora-api";

/**
 * Loop APT, tokens or fungible asset to a position
 * @param agent MoveAgentKit instance
 * @param amount Amount to mint
 * @param leverage Leverage with which user wants to deposit
 * @returns Transaction signature and position ID
 * @example
 * ```ts
 * const transactionHash = await lendToken(agent, amount, APTOS_COIN, positionId, false); // For APT
 * const otherTransactionHash = await lendToken(agent, amount, OTHER_TOKEN, positionId, false); // For another token
 * const fungibleAssetTransactionHash = await lendToken(agent, amount, APTOS_COIN, positionId, false, fungibleAssetAddress); // For fungible asset
 */
export async function openLoop(
	agent: AgentRuntime,
	amount: number,
	leverage: number,
): Promise<{ hash: string; positionId: string }> {
	try {
		const pyth_update_data = await agent.getPythData()

		const fromToken = "0x1::aptos_coin::AptosCoin"
		const toToken = "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::stapt_token::StakedApt"

		const panoraApiData = await callPanoraApi(
			agent,
			fromToken,
			toToken,
			amount
		)
    
	    const transaction = await agent.aptos.transaction.build.simple({
			sender: agent.account.getAddress(),
			data: {
			function: `0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::loops::open_loop`,
			typeArguments: [...panoraApiData.type_arguments], //type arguments response by panora api
			functionArguments: [
					amount,
					leverage,
					pyth_update_data, //VAA data from pyth sdk
					fromToken,
					...panoraApiData.arguments //type arguments response by panora api
			],
			},
		})
		const committedTransactionHash = await agent.account.sendTransaction(transaction)

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		// check transaction receipt

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token mint failed")
			throw new Error("Token mint failed")
		}

		console.log(JSON.stringify(signedTransaction))

		return {
			hash: signedTransaction.hash,
			// @ts-ignore
			positionId: signedTransaction.events[0].data.position_id,
		}
	} catch (error: any) {
		throw new Error(`Token mint failed: ${error.message}`)
	}
}
