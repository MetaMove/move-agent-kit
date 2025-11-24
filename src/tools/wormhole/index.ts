/**
 * Wormhole Toolkit
 * 
 * A comprehensive toolkit for cross-chain operations from Aptos-based blockchains
 * using the Wormhole protocol. This module enables token transfers, USDC bridging
 * via Circle's CCTP, and wrapped token creation across supported blockchains.
 * 
 * Features:
 * - Cross-chain token transfers (native and custom tokens)
 * - USDC transfers via Circle's Cross-Chain Transfer Protocol
 * - Creation of wrapped tokens on destination chains
 * - Support for multiple blockchain platforms (EVM, Solana, Sui, Aptos)
 */

// Export supporting utilities
export * from "./helper";
export * from "./supportedChain";

// Export core functionality
export * from "./cctp";
export * from "./tokenTransfer";
export * from "./wrappedToken";