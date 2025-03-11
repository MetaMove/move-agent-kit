import { GoogleGenerativeAI } from "@google/generative-ai"
import type { AgentRuntime } from "../../agent"

/**
 * Generate text using Google's Gemini API
 * @param agent MoveAgentKit instance
 * @param prompt Text prompt for generation
 * @param model Model to use (default: 'gemini-pro')
 * @returns Object containing the generated text response
 */
export async function generateText(agent: AgentRuntime, prompt: string, model = "gemini-pro") {
	try {
		const apiKey = agent.config.GEMINI_API_KEY
		if (!apiKey) {
			throw new Error("No GEMINI_API_KEY in config")
		}

		const genAI = new GoogleGenerativeAI(apiKey)
		const geminiModel = genAI.getGenerativeModel({ model })

		const response = await geminiModel.generateContent(prompt)
		const result = await response.response.text()

		return {
			text: result,
		}
	} catch (error: any) {
		throw new Error(`Text generation failed: ${error.message}`)
	}
}
