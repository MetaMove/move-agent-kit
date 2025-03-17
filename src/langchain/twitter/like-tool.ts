/**
 * LangChain tool for liking tweets on Twitter
 */
import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"


/**
 * Tool for liking tweets on Twitter using agent-twitter-client
 * Allows LangChain agents to like tweets by their ID
 */
export class TwitterLikeTool extends Tool {
	name = "twitter_like"
	description = `Like a tweet on Twitter to show engagement or save it for later.

How to get a tweet ID:
1. From tweet URL: In "https://twitter.com/username/status/1234567890", the ID is "1234567890"
2. From search results: Use the search_tweets tool first, then extract the tweet ID
3. From user's timeline: Get tweets from a user, then use their IDs

Usage tips:
- Always verify the tweet exists before liking
- Can be used to engage with community tweets
- Can be combined with search to find and like relevant content

Example workflow:
1. Search tweets about Aptos: search_tweets("aptos blockchain updates")
2. Extract tweet ID from results
3. Like the tweet: like_tweet("1234567890")

Note: The tweet must be public and still available. If you get an error, the tweet might be deleted or private.`

	private agent: AgentRuntime

	constructor(agent: AgentRuntime) {
		super()
		this.agent = agent
	}

	/** 
	 * Executes the tweet like operation
	 * @param input - The ID of the tweet to like
	 * @returns A string indicating the result of the operation
	 */
	async _call(input: string): Promise<string> {
		try {
			const result = await this.agent.likeTweet(input)

			if (result.success) {
				return `Successfully liked tweet with ID: ${input}`
			}
			return `Failed to like tweet: ${result.error}`
		} catch (error) {
			return `Error liking tweet: ${error instanceof Error ? error.message : String(error)}`
		}
	}
}