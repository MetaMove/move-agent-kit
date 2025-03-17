/**
 * Twitter like functionality implementation
 */
import type { AgentRuntime } from "../../agent"
import type { TwitterResponse } from "../../types"
import { getAuthenticatedScraper } from "./utils"

/**
 * Likes a tweet on Twitter
 * @param runtime - The agent runtime containing Twitter credentials
 * @param tweetId - The ID of the tweet to like
 * @returns Promise<TwitterResponse> - Response indicating success or failure
 * @throws Error if liking fails
 */
export async function XLike(runtime: AgentRuntime, tweetId: string): Promise<TwitterResponse> {
	try {
		const scraper = await getAuthenticatedScraper(runtime)
		await scraper.likeTweet(tweetId)

		return {
			success: true,
			message: "Tweet liked successfully",
		}
	} catch (error) {
		console.error("Error liking tweet:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}
