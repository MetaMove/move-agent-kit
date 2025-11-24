/**
 * USDC contract addresses for supported blockchains across network environments
 * Used to determine compatible chains for Wormhole cross-chain operations
 */
const usdcContractRegistry = [
    [
        "Mainnet",
        [
          ["Ethereum", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
          ["Avalanche", "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"],
          ["Optimism", "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"],
          ["Arbitrum", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"],
          ["Aptos", "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"],
          ["Solana", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"],
          ["Base", "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"],
          ["Polygon", "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"],
        ],
      ],
      [
        "Testnet",
        [
          ["Sepolia", "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"],
          ["Avalanche", "0x5425890298aed601595a70AB815c96711a31Bc65"],
          ["OptimismSepolia", "0x5fd84259d66Cd46123540766Be93DFE6D43130D7"],
          ["ArbitrumSepolia", "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"],
          ["Aptos", "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832"],
          ["Solana", "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"],
          ["BaseSepolia", "0x036CbD53842c5426634e7929541eC2318f3dCF7e"],
          ["Polygon", "0x9999f7fea5938fd3b1e26a12c3f2fb024e194f97"],
        ],
      ],
  ];
  
  /**
   * Retrieves available chains that support Wormhole cross-chain operations
   * 
   * Returns a comprehensive list of supported blockchains with their
   * respective network environment and USDC contract addresses.
   * 
   * @returns {Promise<string>} JSON string of supported chains data
   * 
   * Example return value:
   * [
   *   { "network": "Mainnet", "chain": "Ethereum", "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
   *   { "network": "Mainnet", "chain": "Move", "address": "0xMoveUSDCMainnetAddress12345678901234567890" },
   *   ...
   * ]
   */
  export const getSupportedWormholeChains = async () => {
    const supportedChainsList = [];
    
    // Extract and format supported chain data
    for (const [networkEnv, chainConfigs] of usdcContractRegistry) {
      for (const [chainName, contractAddress] of chainConfigs) {
        supportedChainsList.push({
          network: networkEnv,
          chain: chainName,
          address: contractAddress,
        });
      }
    }
    
    return JSON.stringify(supportedChainsList);
  };