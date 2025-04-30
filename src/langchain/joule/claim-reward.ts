import { Tool } from "langchain/tools"
import type { AgentRuntime } from "../../agent"
import { AGENT_CLIENT_MODE } from "../../constants"
import { parseJson } from "../../utils"

export class JouleClaimRewardTool extends Tool {
	name = "joule_claim_rewards"
	description = `this tool can be used to claim rewards from Joule pools

    Supports claiming both APT incentives and amAPT incentives.

    User can only claim rewards for coin - 
    usdt - 0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b
    usdc - 0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b
    weth - 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa
    stapt - 0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::stapt_token::StakedApt

    Inputs (input is a JSON string):
    rewardCoinType: string, eg "0x1::aptos_coin::AptosCoin" (required)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string) {
		try {
			const parsedInput = parseJson(input)

			if (AGENT_CLIENT_MODE) {
				return {
					name: this.name,
					args: Object.values(parsedInput),
					onchain: true,
				}
			}

			const claimRewardsTransactionHash = await this.agent.claimReward(parsedInput.rewardCoinType)

			const tokenDetails = await this.agent.getTokenDetails(parsedInput.rewardCoinType)

			return JSON.stringify({
				status: "success",
				claimRewardsTransactionHash,
				reward: {
					coinType: parsedInput.rewardCoinType,
					name: tokenDetails.name,
					type: parsedInput.rewardName,
					decimals: tokenDetails.decimals,
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
