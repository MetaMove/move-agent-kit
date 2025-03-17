/**
 * LangChain tool for retweeting tweets on Twitter
 */
import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"


/**
 * Tool for retweeting tweets on Twitter using agent-twitter-client
 * Allows LangChain agents to retweet tweets by their ID
 */
export class TwitterRetweetTool extends Tool {
	name = "twitter_retweet"
	description = `Retweet (share) a tweet to your followers. This helps amplify important messages and engage with the community.

How to get a tweet ID:
1. From tweet URL: In "https://twitter.com/username/status/1234567890", the ID is "1234567890"
2. From search results: Use the search_tweets tool first, then extract the tweet ID
3. From user's timeline: Get tweets from a user, then use their IDs

Best practices for retweeting:
- Verify tweet content before retweeting
- Focus on official announcements and valuable content
- Avoid retweeting the same content multiple times
- Good for sharing updates and achievements

Example workflow:
1. Search for important tweets: search_tweets("from:aptoslabs announcement")
2. Review the content to ensure it's relevant
3. Retweet using the ID: retweet("1234567890")

Common use cases:
- Sharing Aptos ecosystem updates
- Amplifying community achievements
- Spreading awareness about new features
- Supporting community initiatives

Note: The tweet must be public, not already retweeted by you, and still available. If you get an error, check these conditions.`

	private agent: AgentRuntime

	constructor(agent: AgentRuntime) {
		super()
		this.agent = agent
	}

	/** 
	 * Executes the retweet operation
	 * @param input - The ID of the tweet to retweet
	 * @returns A string indicating the result of the operation
	 */
	async _call(input: string): Promise<string> {
		try {
			const result = await this.agent.retweetTweet(input)

			if (result.success) {
				return `Successfully retweeted tweet with ID: ${input}`
			}
			return `Failed to retweet: ${result.error}`
		} catch (error) {
			return `Error retweeting: ${error instanceof Error ? error.message : String(error)}`
		}
	}
}
