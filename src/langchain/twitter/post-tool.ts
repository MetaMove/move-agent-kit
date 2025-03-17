/**
 * LangChain tool for posting tweets to Twitter
 */
import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"


/**
 * Tool for posting tweets to Twitter using agent-twitter-client
 * Allows LangChain agents to create new tweets
 */
export class TwitterPostTool extends Tool {
	name = "twitter_post"
	description = `Post a new tweet to Twitter. Guidelines for effective tweets:
1. Input should be the exact text to tweet (280 characters max)
2. Include mentions (@username) when referring to other accounts
3. For blockchain content, include relevant tags like $APT for Aptos

Examples:
- "Excited to explore Aptos blockchain! Building with @AptosLabs and the Move language 🚀"
- "Just deployed my first smart contract on Aptos! Check out the tutorial at https://aptoslabs.com #MoveLanguage"
- "Great news for $APT holders! New features coming to the Aptos ecosystem 🎉"

Note: URLs, emojis, and special characters are allowed. For best engagement, keep the message clear and engaging.`

	private agent: AgentRuntime

	constructor(agent: AgentRuntime) {
		super()
		this.agent = agent
	}

	/** 
	 * Executes the tweet posting operation
	 * @param input - The text content to post as a tweet
	 * @returns A string indicating the result of the operation
	 */
	async _call(input: string): Promise<string> {
		try {
			const result = await this.agent.postTweet(input)

			if (result.success) {
				return `Successfully posted tweet: "${input}"`
			}
			return `Failed to post tweet: ${result.error}`
		} catch (error) {
			return `Error posting tweet: ${error instanceof Error ? error.message : String(error)}`
		}
	}
}
