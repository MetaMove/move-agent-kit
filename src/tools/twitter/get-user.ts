/**
 * Twitter user profile functionality implementation
 */
import type { AgentRuntime } from "../../agent"
import type { TwitterUserResponse } from "../../types"
import { getAuthenticatedScraper } from "./utils"

/**
 * Retrieves a user's profile information from Twitter
 * @param runtime - The agent runtime containing Twitter credentials
 * @param username - The username of the Twitter user to fetch
 * @returns Promise<TwitterUserResponse> - Response containing user profile information
 * @throws Error if fetching user profile fails
 */
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
