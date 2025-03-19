import axios from "axios"
import type { AgentRuntime } from "../agent"

export const callPanoraApi = async (
	agent: AgentRuntime,
	fromToken: string,
	toToken: string,
	swapAmount: number,
	toWalletAddress?: string
) => {
	const panoraParameters = {
		fromTokenAddress: fromToken,
		toTokenAddress: toToken,
		fromTokenAmount: swapAmount.toString(),
		toWalletAddress: toWalletAddress ? toWalletAddress : agent.account.getAddress().toString(),
	}

	const url = `https://api.panora.exchange/swap?${new URLSearchParams(panoraParameters).toString()}`

	const panoraApiKey = agent.config.PANORA_API_KEY
	if (!panoraApiKey) {
		throw new Error("No PANORA_API_KEY in config")
	}

	const res = await axios.post(
		url,
		{},
		{
			headers: {
				"x-api-key": panoraApiKey,
			},
		}
	)
	const response = await res.data

	if (response.quotes.length <= 0) {
		throw new Error("no quotes available from panora")
	}

	const transactionData = response.quotes[0].txData

	return transactionData
}