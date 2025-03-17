/**
 * Utility functions for Twitter client tools
 */
import { Scraper } from "agent-twitter-client"
import type { AgentRuntime } from "../../agent"

/**
 * Configuration interface for Twitter credentials
 */
interface TwitterConfig {
	username: string
	password: string
}

/**
 * Creates and returns an authenticated Twitter scraper instance
 * @param runtime - The agent runtime containing Twitter credentials
 * @returns Promise<Scraper> - Authenticated Twitter scraper instance
 * @throws Error if Twitter credentials are missing or login fails
 */
export async function getAuthenticatedScraper(runtime: AgentRuntime): Promise<Scraper> {
	try {
		const twitterConfig = runtime.config.twitter as TwitterConfig | undefined
		const username = twitterConfig?.username
		const password = twitterConfig?.password

		if (!username || !password) {
			throw new Error("Twitter credentials not found in runtime config")
		}

		const scraper = new Scraper()

		try {
			// Add delay before login to avoid immediate detection
			await new Promise(resolve => setTimeout(resolve, 2000))
			
			// Login with retry mechanism
			let loginAttempts = 0
			const maxAttempts = 3
			
			while (loginAttempts < maxAttempts) {
				try {
					await scraper.login(username, password)
					console.log("Successfully logged in to Twitter")
					break
				} catch (loginError) {
					loginAttempts++
					if (loginAttempts === maxAttempts) {
						throw loginError
					}
					console.log(`Login attempt ${loginAttempts} failed, retrying in 5 seconds...`)
					await new Promise(resolve => setTimeout(resolve, 5000))
				}
			}
		} catch (loginError) {
			throw new Error(`Failed to login to Twitter: ${loginError instanceof Error ? loginError.message : String(loginError)}`)
		}

		return scraper
	} catch (error) {
		throw new Error(`Error initializing Twitter scraper: ${error instanceof Error ? error.message : String(error)}`)
	}
}
