# Move Agent Kit - MCP Server Example

This directory contains an example implementation of a Model Control Protocol (MCP) server that integrates Move Agent Kit's tools with Claude AI assistants.

## What is an MCP Server?

The Model Control Protocol (MCP) server allows AI assistants like Claude to access external tools and capabilities. For the Move Agent Kit, this means Claude can interact with the Aptos blockchain and various DeFi protocols directly through a suite of predefined tools.

The MCP server in this example exposes a comprehensive set of blockchain tools that enable Claude to:

- Query account balances and token information
- Transfer, mint, and burn tokens
- Interact with DeFi protocols (lending, borrowing, swapping, staking)
- Create and manage pools
- Execute trades
- Generate images via OpenAI

## Available Protocol Integrations

This MCP server implementation includes tools for interacting with various Aptos protocols:

- **Aptos Core**: Balance checking, token management, transaction details
- **Joule**: Lending, borrowing, and liquidity management
- **Amnis**: Staking operations
- **LiquidSwap**: Pool creation and liquidity operations
- **Aries**: Profile creation and financial operations
- **Thala**: Liquidity, staking and MOD operations
- **Echo**: Staking capabilities
- **Echelon**: Lending and borrowing services
- **MerkleTrade**: Trading operations
- **Panora**: Token swapping
- **OpenAI**: Image generation

## How to Run the MCP Server

### Prerequisites

1. Node.js and npm/pnpm installed
2. An Aptos account with a private key
3. API keys for services (Anthropic, etc.)

### Setup Steps

1. Clone the Move Agent Kit repository
2. Navigate to the MCP server example directory:
   ```bash
   cd examples/mcp-server
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a `.env` file with your API keys and private key:
   ```
   ANTHROPIC_API_KEY="your_anthropic_api_key"
   APTOS_PRIVATE_KEY="your_aptos_private_key"
   PANORA_API_KEY="your_panora_api_key"  # Optional, for Panora integration
   ```

5. Make the run script executable:
   ```bash
   chmod +x run-server.sh
   ```

6. Update the `run-server.sh` script with your actual workspace path if needed.

7. Run the server:
   ```bash
   ./run-server.sh
   ```

## Configuring Claude Desktop

To use this MCP server with Claude Desktop:

1. Locate your Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/config.json`
   - Windows: `%APPDATA%\Claude\config.json`
   - Linux: `~/.config/Claude/config.json`

2. Add the MCP server configuration to your config file. Here's an example that you should modify for your specific paths:

```json
{
  "mcpServers": {
    "agent-kit": {
      "command": "/path/to/your/move-agent-kit/examples/mcp-server/run-server.sh",
      "env": {},
      "args": []
    }
  }
}
```

Ensure you replace `/path/to/your/move-agent-kit` with the actual path to your Move Agent Kit installation.

## Tool Definition

The MCP server requires tools to be defined in a specific format that differs from the regular `createAptosTools` approach used elsewhere in the Move Agent Kit. Tools need to be externally defined for the MCP server to understand their context.

The MCP server expects tools that include:
- A name
- A description
- A schema definition
- A function to execute

We use the `DynamicStructuredTool` from LangChain to provide all these requirements in a format that the MCP server can understand and process.

### Example Tool Definition

```typescript
const tools = [
    new DynamicStructuredTool({
        name: "get_balance",
        description: "Get the balance of a token if no token is provided, it will return the balance of the APT. Divide the balance by 10^8 to get the human readable balance.",
        schema: z.object({
            mint: z.string().optional()
        }),
        func: async ({ mint }) => getBalance(agentRuntime, mint)
    })
];

// Update the agentRuntime configuration with our tools
agentRuntime.config = {
    ...agentRuntime.config,
    tools: tools
};

// Start the MCP server with the configured agentRuntime
startMcpServer(agentRuntime, {
    name: "move-agent-tools",
    version: "1.0.0"
});
```

## Customizing Tools

You can customize the available tools by modifying the `src/index.ts` file. The full set of available tools is defined in `src/mcp/tools.ts`. You can add, remove, or modify tools based on your requirements.

Each tool is defined using the `DynamicStructuredTool` format, which includes:
- `name`: The name of the tool
- `description`: A description of what the tool does
- `schema`: A Zod schema that defines the input parameters
- `func`: An async function that implements the tool's functionality

The tools are grouped by protocol, making it easy to include only the protocols you need for your application.

## Using the MCP Server with Claude

Once your MCP server is running and configured in Claude Desktop, you can ask Claude to perform actions using the available tools. For example:

- "Check my APT balance"
- "Swap 10 APT for USDC using PanoraSwap"
- "Stake 5 APT on Echo"
- "Get details about transaction 0x123..."

https://github.com/user-attachments/assets/1baafb7b-e535-4944-a3ea-59b1ab51c269

Claude will use the appropriate tools to fulfill your requests, interacting with the Aptos blockchain and various protocols as needed.

## Troubleshooting

If you encounter issues with the MCP server:

1. Ensure your API keys and private key are correctly set in the .env file
2. Check that the path in your Claude Desktop configuration points to the correct location
3. Verify that the run-server.sh script has the correct permissions
4. Check the server logs for any error messages

## Disclaimer

This is an example implementation for experimental purposes. Always exercise caution when working with private keys and real funds on blockchains.
