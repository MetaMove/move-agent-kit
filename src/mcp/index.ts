import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import type { AgentRuntime } from "../agent"
import { type MoveSchemaShape, processMoveSchema } from "../utils/mcp-schema"

/**
 * Creates an MCP server from a AgentRuntime
 * @param agentRuntime Instance of AgentRuntime
 * @param options Server configuration options
 */
export function createMcpServer(
	agentRuntime: AgentRuntime,
	options: {
		name: string
		version: string
	}
) {
	// Create MCP server instance
	const server = new McpServer({
		name: options.name,
		version: options.version,
	})

	// Get the tools from the agent
	const tools = agentRuntime.config?.tools || []

	if (!Array.isArray(tools) || tools.length === 0) {
		console.warn("No tools found in agentRuntime.config.tools. MCP server will have no tools registered.")
		return server
	}

	console.log(`Found ${tools.length} tools to register with MCP server`)

	// Convert each tool to an MCP tool
	for (const tool of tools) {
		try {
			if (!tool || !tool.schema || !tool.name || !tool.description) {
				console.warn(`Skipping invalid tool: ${tool?.name || "unnamed"}`)
				continue
			}

			let schema: z.ZodTypeAny
			try {
				schema = z.object(tool.schema.shape || {})
			} catch (schemaError) {
				console.warn(`Error creating schema for tool ${tool.name}, using empty schema instead:`, schemaError)
				schema = z.object({})
			}

			let shape: MoveSchemaShape
			try {
				const processed = processMoveSchema(schema)
				shape = processed.shape
			} catch (processError) {
				console.warn(`Error processing schema for tool ${tool.name}, using empty shape instead:`, processError)
				shape = {}
			}

			server.tool(tool.name, tool.description, shape, async (params) => {
				try {
					// Execute the tool with the params
					const result = await tool.call(params, { agentRuntime })

					// Format the result as MCP tool response
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(result, null, 2),
							},
						],
					}
				} catch (error) {
					console.error(`Move Action Error in tool ${tool.name}:`, error)
					// Handle errors in MCP format
					return {
						isError: true,
						content: [
							{
								type: "text",
								text: error instanceof Error ? error.message : "Unknown Move action error occurred",
							},
						],
					}
				}
			})
			//console.log(`Successfully registered tool: ${tool.name}`);

			// Add examples if available
			if (tool.examples && Array.isArray(tool.examples) && tool.examples.length > 0) {
				server.prompt(
					`${tool.name}-examples`,
					{
						showIndex: z.string().optional().describe("Example index to show (number)"),
					},
					(args) => {
						const showIndex = args.showIndex ? Number.parseInt(args.showIndex) : undefined
						const examples = tool.examples.flat()
						const selectedExamples = typeof showIndex === "number" ? [examples[showIndex]] : examples

						const exampleText = selectedExamples
							.map(
								(ex: any, idx: number) => `
Example ${idx + 1}:
Input: ${JSON.stringify(ex.input, null, 2)}
Output: ${JSON.stringify(ex.output, null, 2)}
Explanation: ${ex.explanation || "No explanation provided"}
              `
							)
							.join("\n")

						return {
							messages: [
								{
									role: "user",
									content: {
										type: "text",
										text: `Examples for Move tool ${tool.name}:\n${exampleText}`,
									},
								},
							],
						}
					}
				)
			}
		} catch (toolError) {
			console.error(`Failed to register tool ${tool?.name || "unnamed"}:`, toolError)
		}
	}

	return server
}

/**
 * Helper to start the MCP server with stdio transport for Move actions
 *
 * @param agent - The React Agent instance
 * @param agentRuntime - The Move agent runtime instance
 * @param options - The options for the MCP server
 * @returns The MCP server instance
 * @throws Error if the MCP server fails to start
 * @example
 * ```typescript
 * import { createReactAgent } from "@langchain/langgraph/prebuilt";
 * import { startMcpServer } from "./mcp";
 *
 * const agent = createReactAgent({
 *   llm,
 *   tools,
 *   checkpointSaver: memory,
 *   messageModifier: "You are a helpful Move agent..."
 * });
 *
 * startMcpServer(agent, agentRuntime, {
 *   name: "move-agent-tools",
 *   version: "1.0.0"
 * });
 * ```
 */
export async function startMcpServer(
	agentRuntime: AgentRuntime,
	options: {
		name: string
		version: string
	}
) {
	try {
		//console.log("Creating MCP server...");
		const server = createMcpServer(agentRuntime, options)
		//console.log("Connecting to stdio transport...");
		const transport = new StdioServerTransport()
		await server.connect(transport)
		//console.log("MCP server connected to transport");
		return server
	} catch (error) {
		throw new Error(`Error starting Move MCP server: ${error}`)
	}
}
