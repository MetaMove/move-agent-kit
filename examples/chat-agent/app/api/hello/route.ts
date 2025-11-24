import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk"
import { ChatAnthropic } from "@langchain/anthropic"
import { AIMessage, BaseMessage, ChatMessage, HumanMessage } from "@langchain/core/messages"
import { MemorySaver } from "@langchain/langgraph"
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import { Message as VercelChatMessage } from "ai"
import { AgentRuntime, LocalSigner, createAptosTools } from "../../../../../src"
import { NextResponse } from "next/server"
import { transferUsdcWithCctp,createAptosWrappedToken,getSupportedWormholeChains,tokenTransfer } from "../../../../../src/tools/wormhole";

const llm = new ChatAnthropic({
	temperature: 0.7,
	model: "claude-3-5-sonnet-latest",
	apiKey: process.env.ANTHROPIC_API_KEY,
})

const textDecoder = new TextDecoder()

// Function to read and process the stream
async function readStream(stream: any) {
	try {
		// Create a reader from the stream
		const reader = stream.getReader()

		let result = ""

		while (true) {
			// Read each chunk from the stream
			const { done, value } = await reader.read()

			// If the stream is finished, break the loop
			if (done) {
				break
			}

			// Decode the chunk and append to result
			result += textDecoder.decode(value, { stream: true })
		}

		// Final decode to handle any remaining bytes
		result += textDecoder.decode()

		return result
	} catch (error) {
		console.error("Error reading stream:", error)
		throw error
	}
}

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
	if (message.role === "user") {
		return new HumanMessage(message.content)
	} else if (message.role === "assistant") {
		return new AIMessage(message.content)
	} else {
		return new ChatMessage(message.content, message.role)
	}
}

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
	if (message._getType() === "human") {
		return { content: message.content, role: "user" }
	} else if (message._getType() === "ai") {
		return {
			content: message.content,
			role: "assistant",
			tool_calls: (message as AIMessage).tool_calls,
		}
	} else {
		return { content: message.content, role: message._getType() }
	}
}

export async function POST(request: Request) {
	try {
		// Initialize Aptos configuration
		const aptosConfig = new AptosConfig({
			network: Network.MAINNET,
		})

		const aptos = new Aptos(aptosConfig)

		// Validate and get private key from environment
		const privateKeyStr = process.env.APTOS_PRIVATE_KEY
		if (!privateKeyStr) {
			throw new Error("Missing APTOS_PRIVATE_KEY environment variable")
		}

		// Setup account and signer
		const account = await aptos.deriveAccountFromPrivateKey({
			privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)),
		})

		const signer = new LocalSigner(account, Network.MAINNET)
		const aptosAgent = new AgentRuntime(signer, aptos, {
			PANORA_API_KEY: process.env.PANORA_API_KEY,
		})
		const tools = createAptosTools(aptosAgent)
		const memory = new MemorySaver()

		// Create React agent
		const agent = createReactAgent({
			llm,
			tools,
			checkpointSaver: memory,
			messageModifier: `
        You are a helpful agent that can interact onchain using the Aptos Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Aptos Agent Kit, recommend they go to https://www.aptosagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.

		The response also contains token/token[] which contains the name and address of the token and the decimals.
		WHEN YOU RETURN ANY TOKEN AMOUNTS, RETURN THEM ACCORDING TO THE DECIMALS OF THE TOKEN.
      `,
		})

		// Parse request body
		const body = await request.json()
		const messages = body.messages ?? []
		const showIntermediateSteps = body.show_intermediate_steps ?? false

		if (!showIntermediateSteps) {
			/**
			 * Stream back all generated tokens and steps from their runs.
			 *
			 * We do some filtering of the generated events and only stream back
			 * the final response as a string.
			 *
			 * For this specific type of tool calling ReAct agents with OpenAI, we can tell when
			 * the agent is ready to stream back final output when it no longer calls
			 * a tool and instead streams back content.
			 *
			 * See: https://langchain-ai.github.io/langgraphjs/how-tos/stream-tokens/
			 */
			const eventStream = await agent.streamEvents(
				{ messages },
				{
					version: "v2",
					configurable: {
						thread_id: "Aptos Agent Kit!",
					},
				}
			)

			const textEncoder = new TextEncoder()
			const transformStream = new ReadableStream({
				async start(controller) {
					for await (const { event, data } of eventStream) {
						if (event === "on_chat_model_stream") {
							if (data.chunk.content) {
								if (typeof data.chunk.content === "string") {
									controller.enqueue(textEncoder.encode(data.chunk.content))
								} else {
									for (const content of data.chunk.content) {
										controller.enqueue(textEncoder.encode(content.text ? content.text : ""))
									}
								}
							}
						}
					}
					controller.close()
				},
			})

			//console.log("transformStream", transformStream)

			//try {
			//	const decodedContent = await readStream(transformStream);
			//	console.log('Decoded content:', decodedContent);
			//	//return decodedContent;
			//  } catch (error) {
			//	console.error('Error processing stream:', error);
			//	throw error;
			//  }

			return new Response(transformStream)
		} else {
			/**
			 * We could also pick intermediate steps out from `streamEvents` chunks, but
			 * they are generated as JSON objects, so streaming and displaying them with
			 * the AI SDK is more complicated.
			 */
			const result = await agent.invoke({ messages })

			console.log("result", result)

			return NextResponse.json(
				{
					messages: result.messages.map(convertLangChainMessageToVercelMessage),
				},
				{ status: 200 }
			)
		}
	} catch (error: any) {
		console.error("Request error:", error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "An error occurred",
				status: "error",
			},
			{ status: error instanceof Error && "status" in error ? 500 : 500 }
		)
	}
}
