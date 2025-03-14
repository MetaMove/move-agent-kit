import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."

export class JouleWithdrawTokenTool extends Tool {
	name = "joule_withdraw_token"
	description = `this tool can be used to withdraw APT, tokens or fungible asset from a position

  if you want to withdraw APT, add "0x1::aptos_coin::AptosCoin" as mint
  if you want to withdraw token other than APT, you need to provide the mint of that specific token
  if you want to withdraw fungible asset, add "0x1::aptos_coin::AptosCoin" as mint and provide fungible asset address
  
  Inputs ( input is a JSON string ):

  amount: number, eg 1 or 0.01 (required)
  mint: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" (required)
  positionId: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const mintDetail = await this.agent.getTokenDetails(parsedInput.mint)

			const withdrawTokenTransactionHash = await this.agent.withdrawToken(
				convertAmountFromHumanReadableToOnChain(parsedInput.amount, mintDetail.decimals || 8),
				parsedInput.mint,
				parsedInput.positionId
			)

			return JSON.stringify({
				status: "success",
				withdrawTokenTransactionHash,
				token: {
					name: mintDetail.name,
					decimals: mintDetail.decimals,
				},
			})
		} catch (error: any) {
			return JSON.stringify({
				status: "error",
				message: error.message,
				code: error.code || "UNKNOWN_ERROR",
			})
		}
	}
}
