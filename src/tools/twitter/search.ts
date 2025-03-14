/**
 * Twitter search functionality implementation
 */
import { SearchMode, type Tweet } from "agent-twitter-client"
import type { AgentRuntime } from "../../agent"
import type { TwitterSearchResponse } from "../../types"
import { getAuthenticatedScraper } from "./utils"

/**
 * Searches for tweets on Twitter
 * @param runtime - The agent runtime containing Twitter credentials
 * @param query - The search query to find tweets
 * @param limit - Maximum number of tweets to return (default: 10)
 * @returns Promise<TwitterSearchResponse> - Response containing search results
 * @throws Error if search fails
 */
export async function XSearch(runtime: AgentRuntime, query: string, limit = 10): Promise<TwitterSearchResponse> {
	try {
		const scraper = await getAuthenticatedScraper(runtime)
		const searchIterator = scraper.searchTweets(query, limit, SearchMode.Latest)

		const posts: Tweet[] = []
		for await (const post of searchIterator) {
			if (!post.text || !post.username || !post.timestamp) continue
			posts.push(post)
			if (posts.length >= limit) break
		}

		const postList = posts
			.filter(post => post.text && post.username && post.timestamp)
			.map(post => ({
				text: post.text!,
				username: post.username!,
				timestamp: post.timestamp!,
			}))

		return {
			success: true,
			posts: postList,
		}
	} catch (error) {
		console.error("Error searching tweets:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}
