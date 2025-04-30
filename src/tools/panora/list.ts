import axios from "axios"
import type { AgentRuntime } from "../../agent"

/**
 * list tokens in panora
 * @param agent MoveAgentKit instance
 * @param tokenAddress Address of the token to get the listed details for
 * @param panoraUI If set to true, only tokens that are visible on the Panora UI are returned. Set as true, false to get all tokens in the list. Default is true.
 * @param panoraTags Returns tokens based on their associated tags
 *
 * @returns Prices for the specified token
 */
export async function listWithPanora(
	agent: AgentRuntime,
	tokenAddress?: string,
	panoraUI = true,
	panoraTags?: string
): Promise<string> {
	try {
		const url = "https://api.panora.exchange/tokenlist"

		const panoraApiKey = agent.config.PANORA_API_KEY

		if (!panoraApiKey) {
			throw new Error("No PANORA_API_KEY in config")
		}

		const res = await axios.get(url, {
			headers: {
				"x-api-key": panoraApiKey,
			},
			params: {
				tokenAddress,
				panoraUI,
				panoraTags,
			},
		})
		const response = await res.data

		return response.data
	} catch (error: any) {
		throw new Error(`List token failed: ${error.message}`)
	}
}
