import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class CctpTransferTool extends Tool {
	name = "cctp_transfer"
	description = `this tool can be used to Transfer USDC from Aptos to another chain.
    
    Inputs (input is a JSON string):
    targetChain: string, eg "Ethereum" or "Avalanche" or "Optimism" or "Arbitrum" or "Aptos" or "Solana" or "Sui"
    transferAmount: number, eg 1 or 0.01 (required)
    networkType: string, eg "Mainnet" or "Testnet" or "Devnet" (required)
    `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
        try{
            const parsedInput = parseJson(input)
            const { targetChain, transferAmount, networkType } = parsedInput
            const result = await this.agent.transferUsdcWithCctp(targetChain, transferAmount, networkType)
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