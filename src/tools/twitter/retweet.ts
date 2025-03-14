/**
 * Twitter retweet functionality implementation
 */
import type { AgentRuntime } from "../../agent"
import type { TwitterResponse } from "../../types"
import { getAuthenticatedScraper } from "./utils"

/**
 * Retweets a tweet on Twitter
 * @param runtime - The agent runtime containing Twitter credentials
 * @param tweetId - The ID of the tweet to retweet
 * @returns Promise<TwitterResponse> - Response indicating success or failure
 * @throws Error if retweeting fails
 */
export async function XRetweet(runtime: AgentRuntime, tweetId: string): Promise<TwitterResponse> {
	try {
		const scraper = await getAuthenticatedScraper(runtime)
		await scraper.retweet(tweetId)

		return {
			success: true,
			message: "Tweet retweeted successfully",
		}
	} catch (error) {
		console.error("Error retweeting:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}
