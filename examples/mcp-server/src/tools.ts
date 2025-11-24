import { startMcpServer } from "../../../src/mcp"
import { AgentRuntime } from "../../../src/agent"
import { LocalSigner } from "../../../src/signers/local-signer"
import * as dotenv from "dotenv"
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk"
import { createMcpTools } from "../../../src/mcp/tools"

dotenv.config()

export async function main() {
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
    const agentRuntime = new AgentRuntime(signer, aptos, {
        PANORA_API_KEY: process.env.PANORA_API_KEY,
    })
    
    // Create tools using our createMcpTools function
    const tools = createMcpTools(agentRuntime)
    
    // Store the tools in agentRuntime.config
    agentRuntime.config = {
        ...agentRuntime.config,
        tools: tools
    }
    
    // Start the MCP server
    try {
        await startMcpServer(agentRuntime, {
            name: "move-agent-tools",
            version: "1.0.0"
        })
        //console.log("MCP server started successfully with Aptos tools")
    } catch (error) {
        console.error("Failed to start MCP server:", error)
    }
}

// Run the main function
main().catch((error) => {
    console.error("Error running MCP server:", error)
    process.exit(1)
}) 