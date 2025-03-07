import axios from "axios"

/**
 * Fetches balance of an aptos account
 * @param agent MoveAgentKit instance
 * @returns Transaction signature
 * @example
 * ```ts
 * const balance = await getBalance(agent)
 * ```
 */
export async function getTokenDetails(tokenAddress: string): Promise<any> {
	try {
		const res = await axios.get(
			"https://raw.githubusercontent.com/PanoraExchange/Aptos-Tokens/refs/heads/main/token-list.json"
		)
		const tokenData = await res.data

		if (!tokenAddress || tokenAddress === "") return tokenData[0]

		const token = tokenData.find(
			(tokenAddr: any) => (tokenAddr.tokenAddress || tokenAddr.faAddress).toLowerCase() === tokenAddress.toLowerCase()
		)

		if (!token && tokenAddress.includes("fa_to_coin_wrapper::WrappedUSDT")) {
			return tokenData.find(
				(e: any) => e.faAddress === "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b"
			)
		}
		if (!token) throw new Error("Cannot find token")

		return token
	} catch (error: any) {
		throw new Error(`Token transfer failed: ${error.message}`)
	}
}
