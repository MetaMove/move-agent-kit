import { z } from "zod"
import { DynamicStructuredTool } from "@langchain/core/tools"
import type { AgentRuntime } from "../agent"
import { AccountAddress } from "@aptos-labs/ts-sdk"

// Import all the tool implementation functions
import {
    getBalance,
    getTokenDetails,
    getTokenPrice,
    getTransaction,
    burnToken,
    createToken,
    mintToken,
    transferTokens,
    stakeTokens,
    unstakeTokens,
    borrowToken,
    lendToken,
    getPoolDetails,
    getUserPosition,
    getUserAllPositions,
    repayToken,
    withdrawToken,
    buyOpenRouterCredits
} from "../tools"

import {
    stakeTokens as amnisStake,
    unstakeTokens as amnisWithdrawStake
} from "../tools/amnis"

import {
    claimReward as jouleClaimReward,
    getPoolDetails as jouleGetPoolDetails,
    getUserAllPositions as jouleGetUserAllPositions,
    getUserPosition as jouleGetUserPosition,
    lendToken as jouleLendToken,
    repayToken as jouleRepayToken,
    withdrawToken as jouleWithdrawToken
} from "../tools"

import {
    addLiquidity as liquidSwapAddLiquidity,
    createPool as liquidSwapCreatePool,
    removeLiquidity as liquidSwapRemoveLiquidity,
    swap as liquidSwapSwap
} from "../tools/liquidswap"

import {
    borrowAriesToken as ariesBorrow,
    createAriesProfile as ariesCreateProfile,
    lendAriesToken as ariesLend,
    repayAriesToken as ariesRepay,
    withdrawAriesToken as ariesWithdraw
} from "../tools/aries"

import {
    borrowTokenWithEchelon as echelonBorrowToken,
    lendTokenWithEchelon as echelonLendToken,
    repayTokenWithEchelon as echelonRepayToken,
    withdrawTokenWithEchelon as echelonWithdrawToken
} from "../tools/echelon"

import {
    stakeTokenWithEcho as echoStakeToken,
    unstakeTokenWithEcho as echoUnstakeToken
} from "../tools/echo"

import {
    closePositionWithMerkleTrade as merkleTradeClosePosition,
    getPositionsWithMerkleTrade as merkleTradeGetPosition,
    placeLimitOrderWithMerkleTrade as merkleTradePlaceLimitOrder,
    placeMarketOrderWithMerkleTrade as merkleTradePlaceMarketOrder
} from "../tools/merkletrade"

import {
    createImage as openaiCreateImage
} from "../tools/openai"

import {
    swapWithPanora as panoraSwap
} from "../tools/panora"

import {
    addLiquidityWithThala as thalaAddLiquidity,
    createPoolWithThala as thalaCreatePool,
    mintMODWithThala as thalaMintMOD,
    redeemMODWithThala as thalaRedeemMOD,
    removeLiquidityWithThala as thalaRemoveLiquidity,
    stakeTokenWithThala as thalaStakeToken,
    unstakeAPTWithThala as thalaUnstakeToken
} from "../tools/thala"

/**
 * Creates tools using DynamicStructuredTool format for MCP server
 * @param agentRuntime The agent runtime instance
 * @returns Array of tools in DynamicStructuredTool format
 */
export function createMcpTools(agentRuntime: AgentRuntime) {
    return [
        // Aptos tools
        new DynamicStructuredTool({
            name: "aptos_balance",
            description: "Get the balance of a Aptos account. If no mint is provided, the balance will be in APT. And the aptos is 8 decimal token so divide by 10^8 to get the amount in Human readable format.",
            schema: z.object({
                mint: z.string().optional().describe("Token mint address. Optional.")
            }),
            func: async ({ mint }) => getBalance(agentRuntime, mint)
        }),
        
        new DynamicStructuredTool({
            name: "aptos_get_wallet_address",
            description: "Get the wallet address of the agent",
            schema: z.object({}),
            func: async () => agentRuntime.account.getAddress().toString()
        }),
        
        new DynamicStructuredTool({
            name: "aptos_transfer_token",
            description: "Transfer tokens to a recipient. If mint is not provided, APT will be transferred.",
            schema: z.object({
                to: z.string().describe("Recipient address"),
                amount: z.number().describe("Amount to transfer"),
                mint: z.string().describe("Token mint address")
            }),
            func: async ({ to, amount, mint }) => {
                const recipientAddress = AccountAddress.from(to);
                return transferTokens(agentRuntime, recipientAddress, amount, mint);
            }
        }),
        
        new DynamicStructuredTool({
            name: "aptos_burn_token",
            description: "Burn tokens from your wallet",
            schema: z.object({
                amount: z.number().describe("Amount to burn"),
                mint: z.string().describe("Token mint address")
            }),
            func: async ({ amount, mint }) => burnToken(agentRuntime, amount, mint)
        }),
        
        new DynamicStructuredTool({
            name: "aptos_get_transaction",
            description: "Get details of a transaction",
            schema: z.object({
                transactionHash: z.string().describe("Transaction hash")
            }),
            func: async ({ transactionHash }) => getTransaction(agentRuntime, transactionHash)
        }),
        
        new DynamicStructuredTool({
            name: "aptos_token_details",
            description: "Get details of a token",
            schema: z.object({
                tokenAddress: z.string().describe("Token address")
            }),
            func: async ({ tokenAddress }) => getTokenDetails(tokenAddress)
        }),
        
        new DynamicStructuredTool({
            name: "aptos_mint_token",
            description: "Mint tokens to a recipient",
            schema: z.object({
                to: z.string().describe("Recipient address"),
                amount: z.string().describe("Amount to mint"),
                mint: z.number().describe("Token mint address")
            }),
            func: async ({ to, amount, mint }) => {
                const recipientAddress = AccountAddress.from(to);
                return mintToken(agentRuntime, recipientAddress, amount, mint);
            }
        }),
        
        new DynamicStructuredTool({
            name: "aptos_create_token",
            description: "Create a new token",
            schema: z.object({
                name: z.string().describe("Token name"),
                symbol: z.string().describe("Token symbol"),
                iconURI: z.string().describe("Token icon URL"),
                projectURI: z.string().describe("Token project URL")
            }),
            func: async ({ name, symbol, iconURI, projectURI }) => createToken(agentRuntime, name, symbol, iconURI, projectURI)
        }),
        
        new DynamicStructuredTool({
            name: "aptos_get_token_price",
            description: "Get the price of a token",
            schema: z.object({
                query: z.string().describe("Token query string")
            }),
            func: async ({ query }) => getTokenPrice(query)
        }),
        
        // Amnis tools
        new DynamicStructuredTool({
            name: "amnis_stake",
            description: "Stake tokens with Amnis",
            schema: z.object({
                amount: z.number().describe("Amount to stake"),
                recipient: z.string().optional().describe("Recipient address (optional)")
            }),
            func: async ({ amount, recipient }) => {
                const recipientAddress = recipient ? AccountAddress.from(recipient) : agentRuntime.account.getAddress();
                return stakeTokens(agentRuntime, recipientAddress, amount);
            }
        }),
        
        new DynamicStructuredTool({
            name: "amnis_withdraw_stake",
            description: "Withdraw staked tokens from Amnis",
            schema: z.object({
                amount: z.number().describe("Amount to withdraw"),
                recipient: z.string().optional().describe("Recipient address (optional)")
            }),
            func: async ({ amount, recipient }) => {
                const recipientAddress = recipient ? AccountAddress.from(recipient) : agentRuntime.account.getAddress();
                return unstakeTokens(agentRuntime, recipientAddress, amount);
            }
        }),
        
        // Joule tools
        new DynamicStructuredTool({
            name: "joule_lend_token",
            description: "Lend tokens on Joule protocol",
            schema: z.object({
                amount: z.number().describe("Amount to lend"),
                mint: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                positionId: z.string().describe("Position ID"),
                newPosition: z.boolean().describe("Create new position flag")
            }),
            func: async ({ amount, mint, positionId, newPosition }) => {
                const mintDetail = await getTokenDetails(mint);
                const fungibleAsset = mintDetail.faAddress?.toLowerCase() === mint.toLowerCase();
                // Convert string to MoveStructId type using as const assertion
                const moveStructId = mint as `${string}::${string}::${string}`;
                return lendToken(agentRuntime, amount, moveStructId, positionId, newPosition, fungibleAsset);
            }
        }),
        
        new DynamicStructuredTool({
            name: "joule_withdraw_token",
            description: "Withdraw tokens from Joule protocol",
            schema: z.object({
                amount: z.number().describe("Amount to withdraw"),
                mint: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                positionId: z.string().describe("Position ID")
            }),
            func: async ({ amount, mint, positionId }) => {
                const mintDetail = await getTokenDetails(mint);
                const fungibleAsset = mintDetail.faAddress?.toLowerCase() === mint.toLowerCase();
                // Convert string to MoveStructId type using as const assertion
                const moveStructId = mint as `${string}::${string}::${string}`;
                return withdrawToken(agentRuntime, amount, moveStructId, positionId, fungibleAsset);
            }
        }),
        
        new DynamicStructuredTool({
            name: "joule_borrow_token",
            description: "Borrow tokens from Joule protocol",
            schema: z.object({
                amount: z.number().describe("Amount to borrow"),
                mint: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                positionId: z.string().describe("Position ID")
            }),
            func: async ({ amount, mint, positionId }) => {
                const mintDetail = await getTokenDetails(mint);
                const fungibleAsset = mintDetail.faAddress?.toLowerCase() === mint.toLowerCase();
                // Convert string to MoveStructId type using as const assertion
                const moveStructId = mint as `${string}::${string}::${string}`;
                return borrowToken(agentRuntime, amount, moveStructId, positionId, fungibleAsset);
            }
        }),
        
        new DynamicStructuredTool({
            name: "joule_repay_token",
            description: "Repay borrowed tokens on Joule protocol",
            schema: z.object({
                amount: z.number().describe("Amount to repay"),
                mint: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                positionId: z.string().describe("Position ID")
            }),
            func: async ({ amount, mint, positionId }) => {
                const mintDetail = await getTokenDetails(mint);
                const fungibleAsset = mintDetail.faAddress?.toLowerCase() === mint.toLowerCase();
                // Convert string to MoveStructId type using as const assertion
                const moveStructId = mint as `${string}::${string}::${string}`;
                return repayToken(agentRuntime, amount, moveStructId, positionId, fungibleAsset);
            }
        }),
        
        new DynamicStructuredTool({
            name: "joule_get_pool_details",
            description: "Get pool details from Joule protocol",
            schema: z.object({
                mint: z.string().describe("Token address")
            }),
            func: async ({ mint }) => getPoolDetails(agentRuntime, mint)
        }),
        
        new DynamicStructuredTool({
            name: "joule_get_user_position",
            description: "Get user position in Joule protocol",
            schema: z.object({
                userAddress: z.string().describe("User address"),
                positionId: z.string().describe("Position ID")
            }),
            func: async ({ userAddress, positionId }) => getUserPosition(agentRuntime, userAddress, positionId)
        }),
        
        new DynamicStructuredTool({
            name: "joule_get_user_all_positions",
            description: "Get all user positions in Joule protocol",
            schema: z.object({
                userAddress: z.string().describe("User address")
            }),
            func: async ({ userAddress }) => getUserAllPositions(agentRuntime, userAddress)
        }),
        
        new DynamicStructuredTool({
            name: "joule_claim_reward",
            description: "Claim rewards from Joule protocol",
            schema: z.object({
                poolId: z.string().describe("Pool ID")
            }),
            func: async ({ poolId }) => jouleClaimReward(agentRuntime, poolId)
        }),
        
        // LiquidSwap tools
        new DynamicStructuredTool({
            name: "liquidswap_create_pool",
            description: "Create a new pool on LiquidSwap",
            schema: z.object({
                coinX: z.string().describe("First token address"),
                coinY: z.string().describe("Second token address"),
            }),
            func: async ({ coinX, coinY }) => {
                const moveStructIdX = coinX as `${string}::${string}::${string}`;
                const moveStructIdY = coinY as `${string}::${string}::${string}`;
                return liquidSwapCreatePool(agentRuntime, moveStructIdX, moveStructIdY);
            }
        }),
        
        new DynamicStructuredTool({
            name: "liquidswap_add_liquidity",
            description: "Add liquidity to a pool on LiquidSwap",
            schema: z.object({
                coinX: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("First token address (MoveStructId format: address::module::struct)"),
                coinY: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Second token address (MoveStructId format: address::module::struct)"),
                amountX: z.number().describe("Amount of first token"),
                amountY: z.number().describe("Amount of second token")
            }),
            func: async ({ coinX, coinY, amountX, amountY }) => {
                const moveStructIdX = coinX as `${string}::${string}::${string}`;
                const moveStructIdY = coinY as `${string}::${string}::${string}`;
                return liquidSwapAddLiquidity(agentRuntime, moveStructIdX, moveStructIdY, amountX, amountY);
            }
        }),
        new DynamicStructuredTool({
            name: "liquidswap_remove_liquidity",
            description: "Remove liquidity from a pool on LiquidSwap",
            schema: z.object({
                coinX: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("First token address (MoveStructId format: address::module::struct)"),
                coinY: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Second token address (MoveStructId format: address::module::struct)"),
                amount: z.number().describe("Amount of LP tokens to remove"),
                minAmountX: z.number().optional().describe("Minimum amount of first token to receive"),
                minAmountY: z.number().optional().describe("Minimum amount of second token to receive")
            }),
            func: async ({ coinX, coinY, amount, minAmountX = 0, minAmountY = 0 }) => {
                const moveStructIdX = coinX as `${string}::${string}::${string}`;
                const moveStructIdY = coinY as `${string}::${string}::${string}`;
                return liquidSwapRemoveLiquidity(agentRuntime, moveStructIdX, moveStructIdY, amount, minAmountX, minAmountY);
            }
        }),
        
        new DynamicStructuredTool({
            name: "liquidswap_swap",
            description: "Swap tokens on LiquidSwap",
            schema: z.object({
                fromCoin: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token to swap from (MoveStructId format: address::module::struct)"),
                toCoin: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token to swap to (MoveStructId format: address::module::struct)"),
                amount: z.number().describe("Amount to swap"),
            }),
            func: async ({ fromCoin, toCoin, amount }) => {
                const moveStructIdFrom = fromCoin as `${string}::${string}::${string}`;
                const moveStructIdTo = toCoin as `${string}::${string}::${string}`;
                return liquidSwapSwap(agentRuntime, moveStructIdFrom, moveStructIdTo, amount);
            }
        }),
        
        // Aries tools
        new DynamicStructuredTool({
            name: "aries_create_profile",
            description: "Create a profile on Aries",
            schema: z.object({}),
            func: async () => ariesCreateProfile(agentRuntime)
        }),
        
        new DynamicStructuredTool({
            name: "aries_withdraw",
            description: "Withdraw tokens from Aries",
            schema: z.object({
                amount: z.number().describe("Amount to withdraw"),
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
            }),
            func: async ({ amount, mintType }) => ariesWithdraw(agentRuntime, mintType as `${string}::${string}::${string}`, amount)
        }),
        
        new DynamicStructuredTool({
            name: "aries_borrow",
            description: "Borrow tokens from Aries",
            schema: z.object({
                amount: z.number().describe("Amount to borrow"),
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
            }),
            func: async ({ amount, mintType }) => ariesBorrow(agentRuntime, mintType as `${string}::${string}::${string}`, amount)
        }),
        
        new DynamicStructuredTool({
            name: "aries_lend",
            description: "Lend tokens on Aries",
            schema: z.object({
                amount: z.number().describe("Amount to lend"),
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
            }),
            func: async ({ amount, mintType }) => ariesLend(agentRuntime, mintType as `${string}::${string}::${string}`, amount)
        }),
        
        new DynamicStructuredTool({
            name: "aries_repay",
            description: "Repay borrowed tokens on Aries",
            schema: z.object({
                amount: z.number().describe("Amount to repay"),
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
            }),
            func: async ({ amount, mintType }) => ariesRepay(agentRuntime, mintType as `${string}::${string}::${string}`, amount)
        }),
        
        // Thala tools
        new DynamicStructuredTool({
            name: "thala_add_liquidity",
            description: "Add liquidity to Thala",
            schema: z.object({
                mintTypeX: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("First token address (MoveStructId format: address::module::struct)"),
                mintTypeY: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Second token address (MoveStructId format: address::module::struct)"),
                mintXAmount: z.number().describe("Amount of first token"),
                mintYAmount: z.number().describe("Amount of second token")
            }),
            func: async ({ mintTypeX, mintTypeY, mintXAmount, mintYAmount }) => thalaAddLiquidity(agentRuntime, mintTypeX as `${string}::${string}::${string}`, mintTypeY as `${string}::${string}::${string}`, mintXAmount, mintYAmount)
        }),
        
        new DynamicStructuredTool({
            name: "thala_remove_liquidity",
            description: "Remove liquidity from Thala",
            schema: z.object({
                mintTypeX: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("First token address (MoveStructId format: address::module::struct)"),
                mintTypeY: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Second token address (MoveStructId format: address::module::struct)"),
                amount: z.number().describe("Amount of LP tokens to remove")
            }),
            func: async ({ mintTypeX, mintTypeY, amount }) => thalaRemoveLiquidity(agentRuntime, mintTypeX as `${string}::${string}::${string}`, mintTypeY as `${string}::${string}::${string}`, amount)
        }),
        
        new DynamicStructuredTool({
            name: "thala_mint_mod",
            description: "Mint MOD on Thala",
            schema: z.object({
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                amount: z.number().describe("Amount to mint")
            }),
            func: async ({ mintType, amount }) => thalaMintMOD(agentRuntime, mintType as `${string}::${string}::${string}`, amount)
        }),
        
        new DynamicStructuredTool({
            name: "thala_redeem_mod",
            description: "Redeem MOD on Thala",
            schema: z.object({
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                amount: z.number().describe("Amount to redeem")
            }),
            func: async ({ mintType, amount }) => thalaRedeemMOD(agentRuntime, mintType as `${string}::${string}::${string}`, amount)
        }),
        
        new DynamicStructuredTool({
            name: "thala_unstake_token",
            description: "Unstake tokens from Thala",
            schema: z.object({
                amount: z.number().describe("Amount to unstake")
            }),
            func: async ({ amount }) => thalaUnstakeToken(agentRuntime, amount)
        }),
        
        new DynamicStructuredTool({
            name: "thala_stake_token",
            description: "Stake tokens on Thala",
            schema: z.object({      
                amount: z.number().describe("Amount to stake")
            }),
            func: async ({amount }) => thalaStakeToken(agentRuntime, amount)
        }),
        
        new DynamicStructuredTool({
            name: "thala_create_pool",
            description: "Create a new pool on Thala",
            schema: z.object({
                mintX: z.string().describe("First token type"),
                mintY: z.string().describe("Second token type"),
                amountX: z.number().describe("Amount of first token"),
                amountY: z.number().describe("Amount of second token"),
                feeTier: z.number().describe("Fee tier"),
                amplificationFactor: z.number().describe("Amplification factor")
            }),
            func: async ({ mintX, mintY, amountX, amountY, feeTier, amplificationFactor }) => 
                thalaCreatePool(agentRuntime, mintX as `${string}::${string}::${string}`, mintY as `${string}::${string}::${string}`, amountX, amountY, feeTier, amplificationFactor)
        }),
        
        // Panora tools
        new DynamicStructuredTool({
            name: "panora_aggregator_swap",
            description: "Swap tokens using Panora aggregator",
            schema: z.object({
                fromCoin: z.string().describe("Token to swap from"),
                toCoin: z.string().describe("Token to swap to"),
                amount: z.number().describe("Amount to swap")
            }),
            func: async ({ fromCoin, toCoin, amount }) => panoraSwap(agentRuntime, fromCoin, toCoin, amount)
        }),
        
        // OpenAI tools
        new DynamicStructuredTool({
            name: "openai_create_image",
            description: "Create an image using OpenAI",
            schema: z.object({
                prompt: z.string().describe("Image description"),
                size: z.string().optional().describe("Image size")
            }),
            func: async ({ prompt, size }) => openaiCreateImage(agentRuntime, prompt, size as "256x256" | "512x512" | "1024x1024" | undefined)
        }),
        
        // Echo tools
        new DynamicStructuredTool({
            name: "echo_stake_token",
            description: "Stake tokens on Echo",
            schema: z.object({
                amount: z.number().describe("Amount to stake")
            }),
            func: async ({ amount }) => echoStakeToken(agentRuntime, amount)
        }),
        
        new DynamicStructuredTool({
            name: "echo_unstake_token",
            description: "Unstake tokens from Echo",
            schema: z.object({
                amount: z.number().describe("Amount to unstake")
            }),
            func: async ({ amount }) => echoUnstakeToken(agentRuntime, amount)
        }),
        
        // Echelon tools
        new DynamicStructuredTool({
            name: "echelon_lend_token",
            description: "Lend tokens on Echelon",
            schema: z.object({
                amount: z.number().describe("Amount to lend"),
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                poolAddress: z.string().describe("Pool address"),
                fungibleAsset: z.boolean().optional().describe("Is fungible asset flag")
            }),
            func: async ({ amount, mintType, poolAddress, fungibleAsset = false }) => 
                echelonLendToken(agentRuntime, mintType as `${string}::${string}::${string}`, amount, poolAddress, fungibleAsset)
        }),
        
        new DynamicStructuredTool({
            name: "echelon_withdraw_token",
            description: "Withdraw tokens from Echelon",
            schema: z.object({
                amount: z.number().describe("Amount to withdraw"),
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                poolAddress: z.string().describe("Pool address"),
                fungibleAsset: z.boolean().optional().describe("Is fungible asset flag")
            }),
            func: async ({ amount, mintType, poolAddress, fungibleAsset = false }) =>
                echelonWithdrawToken(agentRuntime, mintType as `${string}::${string}::${string}`, amount, poolAddress, fungibleAsset)
        }),
        
        new DynamicStructuredTool({
            name: "echelon_repay_token",
            description: "Repay borrowed tokens on Echelon",
            schema: z.object({
                amount: z.number().describe("Amount to repay"),
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                poolAddress: z.string().describe("Pool address"),
                fungibleAsset: z.boolean().optional().describe("Is fungible asset flag")
            }),
            func: async ({ amount, mintType, poolAddress, fungibleAsset = false }) =>
                echelonRepayToken(agentRuntime, mintType as `${string}::${string}::${string}`, amount, poolAddress, fungibleAsset)
        }),
        
        new DynamicStructuredTool({
            name: "echelon_borrow_token",
            description: "Borrow tokens from Echelon",
            schema: z.object({
                amount: z.number().describe("Amount to borrow"),
                mintType: z.string()
                    .regex(/^(0x)?[a-fA-F0-9]+::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/, "Must be a valid Move struct ID in format 'address::module::struct'")
                    .describe("Token address (MoveStructId format: address::module::struct)"),
                poolAddress: z.string().describe("Pool address"),
                fungibleAsset: z.boolean().optional().describe("Is fungible asset flag")
            }),
            func: async ({ amount, mintType, poolAddress, fungibleAsset = false }) =>
                echelonBorrowToken(agentRuntime, mintType as `${string}::${string}::${string}`, amount, poolAddress, fungibleAsset)
        }),
        
        // Merkle Trade tools
        new DynamicStructuredTool({
            name: "merkle_trade_close_position",
            description: "Close a position on Merkle Trade",
            schema: z.object({
                pair: z.string().describe("Pair ID like BTC_USD"),
                isLong: z.boolean().describe("Is long flag")
            }),
            func: async ({ pair, isLong }) => merkleTradeClosePosition(agentRuntime, pair, isLong)
        }),
        
        new DynamicStructuredTool({
            name: "merkle_trade_get_position",
            description: "Get position details from Merkle Trade",
            schema: z.object({
                
            }),
            func: async ({}) => merkleTradeGetPosition(agentRuntime)
        }),
        
        new DynamicStructuredTool({
            name: "merkle_trade_place_limit_order",
            description: "Place a limit order on Merkle Trade",
            schema: z.object({
                pair: z.string().describe("Pair ID like BTC_USD"),
                isLong: z.boolean().describe("True for long, false for short"),
                sizeDelta: z.number().describe("Amount of tokens to buy/sell (in USDC, 10 USDC = 10)"),
                collateralDelta: z.number().describe("Amount of collateral to buy/sell (in USDC, 10 USDC = 10)"),
                price: z.number().describe("Price"),
            }),
            func: async ({ pair, isLong, sizeDelta, collateralDelta, price }) => 
                merkleTradePlaceLimitOrder(agentRuntime, pair, isLong, sizeDelta, collateralDelta, price)
        }),
        
        new DynamicStructuredTool({
            name: "merkle_trade_place_market_order",
            description: "Place a market order on Merkle Trade",
            schema: z.object({
                pair: z.string().describe("Pair ID like BTC_USD"),
                isLong: z.boolean().describe("True for long, false for short"),
                sizeDelta: z.number().describe("Amount of tokens to buy/sell (in USDC, 10 USDC = 10)"),
                collateralDelta: z.number().describe("Amount of collateral to buy/sell (in USDC, 10 USDC = 10)"),
            }),
            func: async ({ pair, isLong, sizeDelta, collateralDelta }) => 
                merkleTradePlaceMarketOrder(agentRuntime, pair, isLong, sizeDelta, collateralDelta)
        }),
        
        // OpenRouter tools
        new DynamicStructuredTool({
            name: "openrouter_buy_credits",
            description: "Buy OpenRouter API credits using USDC on Base. Requires USDC on Base chain and ETH for gas.",
            schema: z.object({
                amountUsd: z.number().describe("Amount of credits to buy in USD")
            }),
            func: async ({ amountUsd }) => buyOpenRouterCredits(agentRuntime, { amountUsd, networkType: "Mainnet" })
        })
    ]
} 