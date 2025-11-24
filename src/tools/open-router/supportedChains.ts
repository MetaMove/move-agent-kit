import type { Chain } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export const chainIdToChain = (chainId: string | number) => {
  if (String(chainId) === String(baseSepolia.id)) {
    return baseSepolia;
  }
  if (String(chainId) === String(base.id)) {
    return base;
  }
  return null;
};

export const chainIdToCdpNetworkId: Record<number, string> = {
  [baseSepolia.id]: 'base-sepolia',
  [base.id]: 'base-mainnet',
};

export function constructBaseScanUrl(
  chain: Chain,
  transactionHash: `0x${string}`,
) {
  if (chain.id === base.id) {
    return `https://basescan.org/tx/${transactionHash}`;
  }

  if (chain.id === baseSepolia.id) {
    return `https://sepolia.basescan.org/tx/${transactionHash}`;
  }
}

export const checkToolSupportsChain = ({
  chainId,
  supportedChains,
}: {
  chainId: number | undefined;
  supportedChains: Chain[];
}) => {
  if (supportedChains.some((chain) => chain.id === chainId)) {
    return true;
  }

  const chainName = chainId
    ? (chainIdToChain(chainId)?.name ?? `chain ${chainId}`)
    : 'chain';

  throw new Error(`Not implemented on ${chainName}`);
};