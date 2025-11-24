import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AptosTokenTransferRequest } from "../../tools/wormhole/types"

export class TokenTransferTool extends Tool {
	name = "token_transfer"
	description = `This tool can be used to transfer a token from the source chain(Aptos as of now) to the destination chain.
    
    Inputs (input is a JSON string):
    targetChain: string, eg "Ethereum" or "Avalanche" or "Optimism" or "Arbitrum" or "Aptos" or "Solana" or "Sui"
    networkType: string, eg "Mainnet" or "Testnet" or "Devnet"
    transferAmount: number, eg 1 or 0.01
    tokenAddress: string, eg "0x1234567890123456789012345678901234567890" in case of Aptos it is 0x1::aptos_coin::AptosCoin
    `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		const parsedInput = parseJson(input)
        const { targetChain, networkType, transferAmount, tokenAddress } = parsedInput
		const result = await this.agent.tokenTransfer(targetChain, networkType, transferAmount, tokenAddress)
		return JSON.stringify(result)
	}
}