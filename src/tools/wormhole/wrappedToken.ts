import { Wormhole, signSendWait, wormhole } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import sui from "@wormhole-foundation/sdk/sui";
import aptos from "@wormhole-foundation/sdk/aptos";
import { getSigner } from "./helper";  
import {
  Chain,
  Network,
  TokenAddress,
  UniversalAddress,
} from "@wormhole-foundation/sdk";
import { WrappedTokenRequest } from "./types";

/**
 * Response structure for wrapped token creation operations
 * 
 * @property {boolean} isSuccess - Operation success status
 * @property {Object} [wrappedTokenInfo] - Created token information (when successful)
 * @property {Chain} wrappedTokenInfo.chainId - The blockchain where token was created
 * @property {string|TokenAddress<Chain>|UniversalAddress} wrappedTokenInfo.tokenAddress - Address of the wrapped token
 * @property {string} [attestTxHash] - Transaction hash of the attestation
 * @property {string} [errorMessage] - Error details if operation failed
 */
export interface WrappedTokenResponse {
  isSuccess: boolean;
  wrappedTokenInfo?: {
    chainId: Chain;
    tokenAddress: string | TokenAddress<Chain> | UniversalAddress;
  };
  attestTxHash?: string;
  errorMessage?: string;
}

/**
 * Verifies if a token is already wrapped on the destination chain
 * 
 * Performs a lookup on the destination chain to determine if the specified
 * source token has already been wrapped, preventing duplicate tokens.
 * 
 * @param {Wormhole<Network>} whInstance - Active Wormhole SDK instance
 * @param {Chain} sourceChain - Origin chain of the token
 * @param {Chain} targetChain - Chain to check for wrapped token
 * @param {string} tokenAddr - Token address on source chain
 * @returns {Promise<TokenAddress<Chain>|UniversalAddress|null>} Wrapped token address or null
 */
export const checkWrappedTokenExists = async (
  whInstance: Wormhole<Network>,
  sourceChain: Chain,
  targetChain: Chain,
  tokenAddr: string,
): Promise<TokenAddress<Chain> | UniversalAddress | null> => {
  try {
    // Convert the token to a Wormhole TokenId format
    const tokenIdentifier = Wormhole.tokenId(sourceChain, tokenAddr);
    const targetChainCtx = whInstance.getChain(targetChain);
    const tokenBridgeTarget = await targetChainCtx.getTokenBridge();

    // Query for existing wrapped token
    const wrappedToken = await tokenBridgeTarget.getWrappedAsset(tokenIdentifier);
    return wrappedToken;
  } catch (error) {
    // If we encounter an error, the token is not wrapped
    return null;
  }
};

/**
 * Creates a wrapped version of a token on a destination chain
 * 
 * This function handles the complete wrapped token creation process:
 * 1. Checks if the token already exists on the destination
 * 2. If not, initiates attestation on the source chain
 * 3. Waits for confirmation from Wormhole guardians
 * 4. Finalizes creation on the destination chain
 * 5. Confirms the token is available
 * 
 * @param {WrappedTokenRequest} request - Parameters for wrapped token creation
 * @returns {Promise<WrappedTokenResponse>} Result of the wrapped token creation
 */
export const createAptosWrappedToken = async (
  request: WrappedTokenRequest,
): Promise<WrappedTokenResponse> => {
  try {
    const { targetChain, originTokenAddress, networkType } = request;
    const gasLimitValue = BigInt(2_500_000);

    // Initialize the Wormhole SDK with all required blockchain platforms
    const whInstance = await wormhole(networkType || "Mainnet", [evm, solana, sui, aptos]);

    // Set up chain contexts
    const originChain = whInstance.getChain("Aptos");
    const destinationChain = whInstance.getChain(targetChain);

    // Check if token is already wrapped
    const existingWrappedToken = await checkWrappedTokenExists(
      whInstance,
      "Aptos",
      targetChain,
      originTokenAddress,
    );
    
    if (existingWrappedToken) {
      return {
        isSuccess: true,
        wrappedTokenInfo: {
          chainId: targetChain,
          tokenAddress: existingWrappedToken,
        },
      };
    }

    // Set up signers for both source and destination chains
    const { signer: destSigner } = await getSigner(destinationChain, gasLimitValue);
    const { signer: originSigner } = await getSigner(originChain);

    // Prepare token bridge instances
    const tokenBridgeDest = await destinationChain.getTokenBridge();
    const tokenBridgeOrigin = await originChain.getTokenBridge();

    // Parse addresses for compatibility
    const parsedTokenAddr = Wormhole.parseAddress(
      originChain.chain,
      originTokenAddress,
    );
    const originSignerAddr = Wormhole.parseAddress(
      originSigner.chain(),
      originSigner.address(),
    );

    // Initiate token attestation on origin chain
    const attestationTxs = tokenBridgeOrigin.createAttestation(
      parsedTokenAddr,
      originSignerAddr,
    );

    // Sign and submit attestation transaction
    const txResults = await signSendWait(originChain, attestationTxs, originSigner);
    const primaryTxId = txResults[0]!.txid;

    // Extract Wormhole message from transaction
    const messages = await originChain.parseTransaction(primaryTxId);

    if (!messages || messages.length === 0) {
      throw new Error("No Wormhole messages found in attestation transaction");
    }

    // Wait for VAA (Verified Action Approval) from guardians
    const timeoutMs = 25 * 60 * 1000; // 25 minutes
    const attestationVaa = await whInstance.getVaa(
      messages[0]!, 
      "TokenBridge:AttestMeta", 
      timeoutMs
    );
    
    if (!attestationVaa) {
      throw new Error("VAA not available after timeout period. Consider extending the timeout.");
    }

    // Submit attestation to destination chain to create wrapped token
    const submitAttestation = tokenBridgeDest.submitAttestation(
      attestationVaa,
      Wormhole.parseAddress(destSigner.chain(), destSigner.address()),
    );

    await signSendWait(destinationChain, submitAttestation, destSigner);

    // Poll for wrapped asset availability
    let wrappedAsset = null;
    let attemptCount = 0;
    const maxPollingAttempts = 10;

    while (!wrappedAsset && attemptCount < maxPollingAttempts) {
      try {
        const tokenId = Wormhole.tokenId(originChain.chain, originTokenAddress);
        wrappedAsset = await tokenBridgeDest.getWrappedAsset(tokenId);
      } catch (error) {
        attemptCount++;
        // Wait between polling attempts
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    if (!wrappedAsset) {
      throw new Error("Wrapped asset not available after maximum polling attempts");
    }

    return {
      isSuccess: true,
      wrappedTokenInfo: {
        chainId: targetChain,
        tokenAddress: wrappedAsset,
      },
      attestTxHash: primaryTxId,
    };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
};