/**
 * LangChain tool for searching tweets on Twitter
 */
import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"


/**
 * Tool for searching tweets on Twitter using agent-twitter-client
 * Allows LangChain agents to search for tweets based on keywords
 */
export class TwitterSearchTool extends Tool {
	name = "twitter_search"
	description = `Search for tweets on Twitter. Returns up to 10 most recent matching tweets.

Search operators you can use:
1. Keywords: Simple words or phrases (e.g., "aptos blockchain")
2. Hashtags: #keyword (e.g., "#AptosNFT")
3. From user: from:username (e.g., "from:aptoslabs")
4. Mentions: @username (e.g., "@aptoslabs")
5. Combine operators: "from:aptoslabs #BuildOnAptos"

Advanced search patterns:
- "aptos blockchain" (exact phrase)
- "aptos OR ethereum" (either term)
- "aptos -nft" (exclude NFT)
- "aptos since:2024-01-01" (date filter)

Example queries:
- "aptos blockchain #MoveLanguage"
- "from:aptoslabs #BuildOnAptos"
- "aptos ecosystem announcements"
- "#AptosNFT marketplace"

The results will include the tweet text and username for each matching tweet. Use these IDs with the like_tweet or retweet tools for engagement.`

	private agent: AgentRuntime

	constructor(agent: AgentRuntime) {
		super()
		this.agent = agent
	}

	/** 
	 * Executes the tweet search operation
	 * @param input - The search query to find tweets
	 * @returns A string containing the search results
	 */
	async _call(input: string): Promise<string> {
		try {
			const result = await this.agent.searchTweets(input)

			if (result.success && result.posts?.length) {
				const tweets = result.posts.map((post) => `- ${post.text} (by @${post.username})`).join("\n")
				return `Search results for "${input}":\n${tweets}`
			}
			return `Failed to search tweets: ${result.error || "No results found"}`
		} catch (error) {
			return `Error searching tweets: ${error instanceof Error ? error.message : String(error)}`
		}
	}
}
