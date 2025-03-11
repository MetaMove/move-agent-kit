import axios from "axios"
import type { AgentRuntime } from "../../agent"

interface DevToArticle {
	title: string
	bodyMarkdown: string
	tags?: string[]
	series?: string
	published?: boolean
	canonicalUrl?: string
	description?: string
	coverImage?: string
}

/**
 * Publish an article to dev.to using their API
 * @param agent MoveAgentKit instance
 * @param article Article details including title, content, and optional parameters
 * @returns Object containing the published article data
 */
export async function publishArticle(agent: AgentRuntime, article: DevToArticle) {
	try {
		const apiKey = agent.config.DEVTO_API_KEY
		if (!apiKey) {
			throw new Error("No DEVTO_API_KEY in config")
		}

		const apiUrl = "https://dev.to/api/articles"

		const response = await axios.post(
			apiUrl,
			{
				article: {
					title: article.title,
					body_markdown: article.bodyMarkdown,
					tags: article.tags || [],
					series: article.series,
					published: article.published ?? true,
					canonical_url: article.canonicalUrl,
					description: article.description,
					cover_image: article.coverImage,
				},
			},
			{
				headers: {
					"Content-Type": "application/json",
					"api-key": apiKey,
				},
			}
		)

		return {
			article: response.data,
			success: true,
		}
	} catch (error: any) {
		throw new Error(`Failed to publish article: ${error.response?.data?.error || error.message}`)
	}
}
