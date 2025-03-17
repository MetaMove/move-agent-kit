import type { AgentRuntime } from "../agent"
import { AptosAccountAddressTool } from "./account"
import { AmnisStakeTool, AmnisWithdrawStakeTool } from "./amnis"
import {
	AptosBalanceTool,
	AptosBurnTokenTool,
	AptosCreateTokenTool,
	AptosGetTokenDetailTool,
	AptosGetTokenPriceTool,
	AptosMintTokenTool,
	AptosTransactionTool,
	AptosTransferTokenTool,
} from "./aptos"
import { AriesBorrowTool, AriesCreateProfileTool, AriesLendTool, AriesRepayTool, AriesWithdrawTool } from "./aries"
import {
	JouleBorrowTokenTool,
	JouleClaimRewardTool,
	JouleGetPoolDetails,
	JouleGetUserAllPositions,
	JouleGetUserPosition,
	JouleLendTokenTool,
	JouleRepayTokenTool,
	JouleWithdrawTokenTool,
} from "./joule"
import {
	LiquidSwapAddLiquidityTool,
	LiquidSwapCreatePoolTool,
	LiquidSwapRemoveLiquidityTool,
	LiquidSwapSwapTool,
} from "./liquidswap"

import type { ToolsNameList } from "../types"
import {
	EchelonBorrowTokenTool,
	EchelonLendTokenTool,
	EchelonRepayTokenTool,
	EchelonWithdrawTokenTool,
} from "./echelon"
import { EchoStakeTokenTool, EchoUnstakeTokenTool } from "./echo"
import {
	MerkleTradeClosePositionTool,
	MerkleTradeGetPositionTool,
	MerkleTradePlaceLimitOrderTool,
	MerkleTradePlaceMarketOrderTool,
} from "./merkletrade"
import { OpenAICreateImageTool } from "./openai"
import { PanoraSwapTool } from "./panora"
import {
	ThalaAddLiquidityTool,
	ThalaMintMODTool,
	ThalaRedeemMODTool,
	ThalaRemoveLiquidityTool,
	ThalaStakeTokenTool,
	ThalaUnstakeTokenTool,
} from "./thala"
import { ThalaCreatePoolTool } from "./thala/create-pool"
import { 
	TwitterPostTool,
	TwitterLikeTool,
	TwitterRetweetTool,
	TwitterSearchTool,
	TwitterGetUserTool,
} from "./twitter"

export const createAptosTools = (agent: AgentRuntime, config: { filter?: ToolsNameList[] } = {}) => {
	const tools = [
		// Aptos tools
		new AptosBalanceTool(agent),
		new AptosAccountAddressTool(agent),
		new AptosTransferTokenTool(agent),
		// new AptosBurnNFTTool(agent),
		new AptosBurnTokenTool(agent),
		// new AptosTransferNFTTool(agent),
		new AptosTransactionTool(agent),
		new AptosGetTokenDetailTool(agent),
		new AptosMintTokenTool(agent),
		new AptosCreateTokenTool(agent),
		new AptosGetTokenPriceTool(agent),
		// Amnis tools
		new AmnisStakeTool(agent),
		new AmnisWithdrawStakeTool(agent),
		// Joule tools
		new JouleLendTokenTool(agent),
		new JouleWithdrawTokenTool(agent),
		new JouleBorrowTokenTool(agent),
		new JouleRepayTokenTool(agent),
		new JouleGetPoolDetails(agent),
		new JouleGetUserPosition(agent),
		new JouleGetUserAllPositions(agent),
		new JouleClaimRewardTool(agent),
		// LiquidSwap tools
		new LiquidSwapCreatePoolTool(agent),
		new LiquidSwapAddLiquidityTool(agent),
		new LiquidSwapRemoveLiquidityTool(agent),
		new LiquidSwapSwapTool(agent),
		// Aries tools
		new AriesCreateProfileTool(agent),
		new AriesWithdrawTool(agent),
		new AriesBorrowTool(agent),
		new AriesLendTool(agent),
		new AriesRepayTool(agent),
		// Thala tools
		new ThalaAddLiquidityTool(agent),
		new ThalaRemoveLiquidityTool(agent),
		new ThalaMintMODTool(agent),
		new ThalaRedeemMODTool(agent),
		new ThalaUnstakeTokenTool(agent),
		new ThalaStakeTokenTool(agent),
		new ThalaCreatePoolTool(agent),
		// Panora tools
		new PanoraSwapTool(agent),
		// OpenAI tools
		new OpenAICreateImageTool(agent),
		// Echo tools
		new EchoStakeTokenTool(agent),
		new EchoUnstakeTokenTool(agent),
		// Echelon tools
		new EchelonLendTokenTool(agent),
		new EchelonWithdrawTokenTool(agent),
		new EchelonRepayTokenTool(agent),
		new EchelonBorrowTokenTool(agent),
		// Merkletrade Tools
		new MerkleTradeClosePositionTool(agent),
		new MerkleTradeGetPositionTool(agent),
		new MerkleTradePlaceLimitOrderTool(agent),
		new MerkleTradePlaceMarketOrderTool(agent),
		// Twitter Tools
		new TwitterPostTool(agent),
		new TwitterLikeTool(agent),
		new TwitterRetweetTool(agent),
		new TwitterSearchTool(agent),
		new TwitterGetUserTool(agent),
	]

	return config.filter ? tools.filter((tool) => config?.filter?.includes(tool.name as ToolsNameList)) : tools
}

export * from "./account"
export * from "./amnis"
export * from "./aptos"
export * from "./joule"
export * from "./aries"
export * from "./echelon"
export * from "./echo"
export * from "./liquidswap"
export * from "./panora"
export * from "./openai"
export * from "./thala"
export * from "./twitter"