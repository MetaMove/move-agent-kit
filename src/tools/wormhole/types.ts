import {
    Chain,
    Network,
    TokenId,
  } from "@wormhole-foundation/sdk";
  
  /**
   * Input parameters for creating a wrapped token on a destination chain
   * 
   * @property {Chain} targetChain - Destination blockchain for wrapped token creation
   * @property {string} originTokenAddress - Token address on the source chain (Move)
   * @property {Network} [networkType] - Network environment ("Mainnet", "Testnet", "Devnet")
   */
  export interface WrappedTokenRequest {
    targetChain: Chain;
    originTokenAddress: string;
    networkType?: "Mainnet" | "Testnet" | "Devnet";
  }

  /**
 * Configuration for USDC transfers via Circle's Cross-Chain Transfer Protocol
 * 
 * @property {Chain} targetChain - Destination blockchain for the USDC transfer
 * @property {string} transferAmount - Amount of USDC to transfer (as string)
 * @property {Network} [networkType] - Network environment ("Mainnet", "Testnet", "Devnet")
 */

  export interface AptosCctpTransferRequest {
    targetChain: Chain;
    transferAmount: string;
    networkType?: "Mainnet" | "Testnet" | "Devnet";
  }


/**
 * Configuration for cross-chain token transfers from Aptos to other blockchains
 * 
 * @property {Chain} targetChain - Destination blockchain for the token transfer
 * @property {Network} [network] - Network environment ("Mainnet", "Testnet", "Devnet")
 * @property {string} transferAmount - Amount of tokens to transfer (as string)
 * @property {TokenId} [tokenAddress] - Optional token address to transfer (if omitted, native token is used)
 */

  export interface AptosTokenTransferRequest {
    targetChain: Chain;
    networkType?: "Mainnet" | "Testnet" | "Devnet";
    transferAmount: string;
    tokenAddress?: TokenId | string;
  }