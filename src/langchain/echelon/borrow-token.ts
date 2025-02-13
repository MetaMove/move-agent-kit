import { type MoveStructId, convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { getTokenByTokenAddress, getTokenByTokenName } from "../../utils/get-pool-address-by-token-name"

export class EchelonBorrowTokenTool extends Tool {
	name = "echelon_borrow_token"
	description = `this tool can be used to borrow APT, tokens or fungible asset from a position

  if you want to borrow APT, mint will be "0x1::aptos_coin::AptosCoin"

  if user added mint as asset name, and you don't have the address of the asset, you can use the following token names:
  ['usdt', 'zusdt', 'zusdc', 'apt', 'sthapt', 'mod', 'thl', 'wusdc' , 'zweth', 'wweth', 'cake', 'stapt', 'abtc', 'stone' , 'truapt', 'sbtc']
  or whatever name the user has provided, you can use the token name to get the address of the token 


  Inputs ( input is a JSON string ) (IMPORTANT):
  amount: number, eg 1 or 0.01 (required)
  mint: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" or "usdt (name of the token)" (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const token = getTokenByTokenName(parsedInput.mint) || getTokenByTokenAddress(parsedInput.mint)

			if (!token) throw new Error("Token not found")

			const mintDetail = await this.agent.getTokenDetails(token.tokenAddress)

			const borrowTokenTransactionHash = await this.agent.borrowTokenWithEchelon(
				token.tokenAddress as MoveStructId,
				convertAmountFromHumanReadableToOnChain(parsedInput.amount, mintDetail.decimals || 8),
				token.poolAddress,
				token.tokenAddress.split("::").length !== 3
			)

			return JSON.stringify({
				status: "success",
				borrowTokenTransactionHash,
				token: {
					name: mintDetail.name || "APT",
					decimals: mintDetail.decimals || 8,
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
