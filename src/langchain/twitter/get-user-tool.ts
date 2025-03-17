/**
 * LangChain tool for retrieving Twitter user profiles
 */
import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"

/**
 * Tool for getting Twitter user profiles using agent-twitter-client
 * Allows LangChain agents to fetch user information by username
 */
export class TwitterGetUserTool extends Tool {
	name = "twitter_get_user"
	description = `Get detailed information about a Twitter user's profile.

Input format:
- Username without the '@' symbol
- Case-insensitive (e.g., 'aptoslabs' or 'AptosLabs' work the same)
- Do not include 'twitter.com' or full URLs

Example usernames:
- 'aptoslabs' (for @aptoslabs)
- 'aptos_network' (for @aptos_network)
- 'movebuilder' (for @movebuilder)

Information returned:
1. Display name (the user's chosen name)
2. Follower count (number of followers)
3. Total posts (number of tweets)

Use cases:
- Verify official accounts
- Check community influence
- Monitor account growth
- Find active developers

Example workflow:
1. Get profile: get_user("aptoslabs")
2. Analyze follower count and post frequency
3. Use info to identify key community members

Note: Only public profiles can be accessed. Private accounts will return an error. Use this tool to verify accounts before interacting with their content.`

	private agent: AgentRuntime

	constructor(agent: AgentRuntime) {
		super()
		this.agent = agent
	}

	/** 
	 * Executes the user profile fetch operation
	 * @param input - The username of the Twitter user to fetch
	 * @returns A string containing the user's profile information
	 */
	async _call(input: string): Promise<string> {
		try {
			const result = await this.agent.getTwitterUser(input)

			if (result.success && result.profile) {
				const { name = "Unknown", followers = 0, posts = 0 } = result.profile
				return `Profile for ${input}:\nName: ${name}\nFollowers: ${followers}\nTotal Posts: ${posts}`
			}
			return `Failed to get user profile: ${result.error || "Profile not found"}`
		} catch (error) {
			return `Error getting user profile: ${error instanceof Error ? error.message : String(error)}`
		}
	}
}
