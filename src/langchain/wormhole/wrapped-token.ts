import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class CreateWrappedTokenTool extends Tool {
	name = "create_wrapped_token"
	description = `This tool can be used to create a wrapped token on the destination chain for a token on the source chain(Aptos as of now)
    
    Inputs (input is a JSON string):
    targetChain: string, eg "Ethereum" or "Avalanche" or "Optimism" or "Arbitrum" or "Aptos" or "Solana" or "Sui"
    tokenAddress: string, eg "0x1234567890123456789012345678901234567890"
    networkType: string, eg "Mainnet" or "Testnet" or "Devnet"
    `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)
            const { targetChain, tokenAddress, networkType } = parsedInput
			const result = await this.agent.createAptosWrappedToken(targetChain, tokenAddress, networkType)
			return JSON.stringify(result)
		} catch (error: any) {
			return JSON.stringify({
				status: "error",
				message: error.message,
				code: error.code || "UNKNOWN_ERROR",
			})
		}
	}
}