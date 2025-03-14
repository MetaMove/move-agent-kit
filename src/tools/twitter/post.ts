/**
 * Twitter posting functionality implementation
 */
import { SearchMode, type Tweet } from "agent-twitter-client"
import type { AgentRuntime } from "../../agent"
import type { TwitterPostResponse, TwitterResponse, TwitterSearchResponse, TwitterUserResponse } from "../../types"
import { getAuthenticatedScraper } from "./utils"

/**
 * Posts a tweet to Twitter
 * @param runtime - The agent runtime containing Twitter credentials
 * @param post - The text content to post as a tweet
 * @returns Promise<TwitterPostResponse> - Response containing tweet details
 * @throws Error if posting fails
 */
export async function XPost(runtime: AgentRuntime, post: string): Promise<TwitterPostResponse> {
	try {
		const scraper = await getAuthenticatedScraper(runtime)
		const response = await scraper.sendTweet(post)

		return {
			success: true,
			result: {
				text: post,
				id: response.toString(),
				timestamp: Date.now(),
			},
			message: "Tweet posted successfully",
		}
	} catch (error) {
		console.error("Error posting to Twitter:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}

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

export async function XSearch(runtime: AgentRuntime, query: string, limit = 10): Promise<TwitterSearchResponse> {
	try {
		const scraper = await getAuthenticatedScraper(runtime)
		const searchIterator = scraper.searchTweets(query, limit, SearchMode.Latest)

		const posts: Array<Required<Pick<Tweet, "text" | "username" | "timestamp">>> = []
		for await (const post of searchIterator) {
			if (!post.text || !post.username || !post.timestamp) continue
			posts.push({
				text: post.text,
				username: post.username,
				timestamp: post.timestamp,
			})
			if (posts.length >= limit) break
		}

		return {
			success: true,
			posts: posts,
		}
	} catch (error) {
		console.error("Error searching tweets:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}

export async function XGetUser(runtime: AgentRuntime, username: string): Promise<TwitterUserResponse> {
	try {
		const scraper = await getAuthenticatedScraper(runtime)
		const profile = await scraper.getProfile(username)

		if (!profile.name || profile.followersCount === undefined || profile.statusesCount === undefined) {
			throw new Error("Invalid profile data received")
		}

		return {
			success: true,
			profile: {
				name: profile.name,
				followers: profile.followersCount,
				posts: profile.statusesCount,
			},
		}
	} catch (error) {
		console.error("Error getting user profile:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}
