import { startMcpServer } from "../../../src/index"
import { AgentRuntime } from "../../../src/agent"
import { LocalSigner } from "../../../src/signers/local-signer"
import { z } from "zod";
import * as dotenv from "dotenv";
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { 
    getBalance,
    getTokenDetails,
    getTokenPrice,
    getTransaction
} from "../../../src/tools/aptos";
import { transferUsdcWithCctp,createAptosWrappedToken,getSupportedWormholeChains,tokenTransfer } from "../../../src/tools/wormhole/index";
import {buyOpenRouterCredits} from "../../../src/tools/open-router/index";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { chain } from "@wormhole-foundation/sdk/dist/cjs";

dotenv.config();

// Add this enum definition before the tools array
enum WormholeChain {
    Solana = 1,
    Ethereum = 2,
    Aptos = 22,
    Sui = 21
}

export async function main() {
    const aptosConfig = new AptosConfig({
        network: Network.MAINNET,
    });
    
    const aptos = new Aptos(aptosConfig);
    
    // Validate and get private key from environment
    const privateKeyStr = process.env.APTOS_PRIVATE_KEY;
    if (!privateKeyStr) {
        throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
    }
    
    // Setup account and signer
    const account = await aptos.deriveAccountFromPrivateKey({
        privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)),
    });
    
    const signer = new LocalSigner(account, Network.MAINNET);
    const agentRuntime = new AgentRuntime(signer, aptos, {
        PANORA_API_KEY: process.env.PANORA_API_KEY,
    });
    //console.log("Agent runtime created");

    // Create a few simple tools with well-defined schemas
    const tools = [
        new DynamicStructuredTool({
            name: "get_balance",
            description: "Get the balance of a token if no token is provided, it will return the balance of the APT and divide it by 10^8 for aptos or apt. The balance for usdc which is 0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b address token is divided by 10^6.",
            schema: z.object({
                mint: z.string().optional()
            }),
            func: async ({ mint }) => getBalance(agentRuntime, mint)
        }),
        new DynamicStructuredTool({
            name: "get_token_details",
            description: "Get details of a token",
            schema: z.object({
                tokenAddress: z.string()
            }),
            func: async ({ tokenAddress }) => getTokenDetails(tokenAddress)
        }),
        new DynamicStructuredTool({
            name: "get_token_price",
            description: "Get the price of a token",
            schema: z.object({
                query: z.string()
            }),
            func: async ({ query }) => getTokenPrice(query)
        }),
        new DynamicStructuredTool({
            name: "get_transaction",
            description: "Get transaction details",
            schema: z.object({
                hash: z.string()
            }),
            func: async ({ hash }) => getTransaction(agentRuntime, hash)
        }),
        new DynamicStructuredTool({
            name: "create_wrapped_token",
            description: "Create a wrapped token on the destination chain",
            schema: z.object({
                targetChain: z.enum(["Solana", "Ethereum", "Aptos", "Sui"]),
                tokenAddress: z.string(),
                networkType: z.enum(["Mainnet", "Testnet", "Devnet"])
            }),
            func: async ({ targetChain, tokenAddress, networkType }) => createAptosWrappedToken({targetChain, originTokenAddress: tokenAddress, networkType})
        }),
        new DynamicStructuredTool({
            name: "token_transfer",
            description: "Transfer a token from the source chain to the destination chain",
            schema: z.object({
                targetChain: z.enum(["Solana", "Ethereum", "Aptos", "Sui", "Terra", "Bsc", "Polygon", "Avalanche", "Oasis", "Algorand", "Aurora", "Fantom", "Karura", "Acala", "Klaytn", "Celo", "Near"]),
                networkType: z.enum(["Mainnet", "Testnet", "Devnet"]),
                transferAmount: z.string(),
                tokenAddress: z.string()
            }),
            func: async ({ targetChain, networkType, transferAmount, tokenAddress }) => tokenTransfer({
                targetChain,
                networkType,
                transferAmount,
                tokenAddress
            })
        }),
        new DynamicStructuredTool({
            name: "get_supported_wormhole_chains",
            description: "Get the list of supported chains by Wormhole",
            schema: z.object({}),
            func: async () => getSupportedWormholeChains()
        }),
        new DynamicStructuredTool({
            name: "transfer_usdc_with_cctp",
            description: "Transfer a USDC from the source chain to the destination chain using CCTP",
            schema: z.object({
                targetChain: z.enum(["Solana", "Ethereum", "Aptos", "Sui", "Terra", "Bsc", "Polygon", "Avalanche", "Oasis", "Algorand", "Aurora", "Fantom", "Karura", "Acala", "Klaytn", "Celo", "Base"]),
                networkType: z.enum(["Mainnet", "Testnet", "Devnet"]),
                transferAmount: z.string(),
            }),
            func: async ({ targetChain, networkType, transferAmount }) => transferUsdcWithCctp({
                targetChain,
                transferAmount,
                networkType
            })
        }),
        new DynamicStructuredTool({
            name: "buy_openrouter_credits",
            description: "This tool can be used to buy OpenRouter credits using USDC from your Aptos wallet. It will automatically transfer the USDC from Aptos to Base chain and then purchase the credits.",
            schema:z.object({
                transferAmount: z.string(),
                networkType: z.enum(["Mainnet", "Testnet", "Devnet"]),
            }),
            func: async({ transferAmount, networkType }) => buyOpenRouterCredits(
                agentRuntime,
                { amountUsd: Number(transferAmount), networkType }
            )
        }),
    ];
    
    // Store the tools in agentRuntime.config
    agentRuntime.config = {
        ...agentRuntime.config,
        tools: tools
    };
    //console.log("Agent runtime config updated with", tools.length, "tools");

    // Start the MCP server
    try {
        await startMcpServer(agentRuntime, {
            name: "move-agent-tools",
            version: "1.0.0"
        });
        //console.log("MCP server started successfully");
    } catch (error) {
        console.error("Failed to start MCP server:", error);
        // Continue running the program even if MCP server fails
        //console.log("Continuing without MCP server...");
    }
}

// Run the main function
main().catch((error) => {
    console.error("Error running MCP server:", error);
    process.exit(1);
});