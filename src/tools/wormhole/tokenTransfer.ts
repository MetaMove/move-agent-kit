import { getTokenDecimals, getSigner } from "./helper";
import evm from "@wormhole-foundation/sdk/evm";
import { AptosTokenTransferRequest } from "./types";
import {
  wormhole,
  TokenId,
  Wormhole,
  amount,
  TokenTransfer,
  isTokenId,
  network,
} from "@wormhole-foundation/sdk";
import sui from "@wormhole-foundation/sdk/sui";
import aptos from "@wormhole-foundation/sdk/aptos";
import solana from "@wormhole-foundation/sdk/solana";
import {createAptosWrappedToken, checkWrappedTokenExists } from "./wrappedToken";

/**
 * Executes cross-chain token transfers from Aptos to other supported chains
 * 
 * Handles all aspects of the cross-chain transfer process including:
 * - Native token transfers
 * - Automatic token wrapping when needed on destination chain
 * 
 * @param {AptosTokenTransferRequest} request - Transfer configuration parameters
 * @returns {Promise<any>} Response with transfer status and transaction details
 */
export const tokenTransfer = async (
  request: AptosTokenTransferRequest,
): Promise<any> => {
  try {
    const { targetChain, networkType, transferAmount, tokenAddress } = request;

    // Initialize Wormhole SDK with all necessary blockchain adapters
    const whInstance = await wormhole(networkType || "Mainnet", [evm, solana, sui, aptos]);

    // Define source and destination chain identifiers
    const sourceChainId = "Aptos";
    const destChainId = targetChain;

    // Get chain contexts and signers
    const sourceChain = whInstance.getChain(sourceChainId);
    const sourceSigner = await getSigner(sourceChain);

    const destChain = whInstance.getChain(destChainId);
    const destSigner = await getSigner(destChain);

    // Format token identifier appropriately
    let tokenIdentifier: TokenId;

    if (!tokenAddress) {
      // Use native token when no specific token address provided
      tokenIdentifier = Wormhole.tokenId(sourceChain.chain, "native");
    } else if (typeof tokenAddress === "string") {
      // Convert string token address to TokenId format
      tokenIdentifier = Wormhole.tokenId(sourceChain.chain, tokenAddress);
    } else if (isTokenId(tokenAddress)) {
      // Use the provided TokenId directly
      tokenIdentifier = tokenAddress;
    } else {
      // Default to native token for unrecognized formats
      tokenIdentifier = Wormhole.tokenId(sourceChain.chain, "native");
    }

    // For non-native tokens, ensure they're properly wrapped on destination
    if (tokenIdentifier.address !== "native") {
      const tokenAddressString = tokenIdentifier.address.toString();

      // Check for existing wrapped token on destination
      const wrappedTokenExists = await checkWrappedTokenExists(
        whInstance,
        sourceChainId,
        destChainId,
        tokenAddressString,
      );

      // Create wrapped token if it doesn't exist
      if (!wrappedTokenExists) {
        const wrappingResult = await createAptosWrappedToken({
          targetChain: destChainId,
          originTokenAddress: tokenAddressString,
          networkType: networkType || "Testnet",
        });

        if (!wrappingResult.isSuccess) {
          throw new Error(
            `Failed to create wrapped token: ${wrappingResult.errorMessage}`,
          );
        }
      }
    }

    // Parse transfer amount with proper decimal precision
    const amountToTransfer = transferAmount ?? "0.01";
    const useAutomatic = false; // Manual mode (not using automatic relayers)

    // Get token decimals for correct amount parsing
    const decimals = await getTokenDecimals(whInstance, tokenIdentifier, sourceChain);

    // Create token transfer object
    const transfer = await whInstance.tokenTransfer(
      tokenIdentifier,
      amount.units(amount.parse(amountToTransfer, decimals)),
      sourceSigner.address,
      destSigner.address,
      useAutomatic,
    );

    // Get transfer cost estimate
    const transferQuote = await TokenTransfer.quoteTransfer(
      whInstance,
      sourceSigner.chain,
      destSigner.chain,
      transfer.transfer,
    );

    // Validate transfer amount covers fees for automatic transfers
    if (transfer.transfer.automatic && transferQuote.destinationToken.amount < 0) {
      throw "Transfer amount too small to cover associated fees and requested native gas";
    }

    // Execute transfer on source chain
    const sourceTxIds = await transfer.initiateTransfer(sourceSigner.signer);

    // For automatic transfers, we're done
    if (useAutomatic) {
      return {
        isSuccess: true,
        sourceTransactions: sourceTxIds,
        transferId: transfer.txids[0],
      };
    }

    // For manual transfers, wait for attestation and complete on destination
    let attestation = null;
    let attemptCount = 0;
    const maxAttempts = 10;

    // Poll for attestation availability
    while (!attestation && attemptCount < maxAttempts) {
      try {
        attestation = await transfer.fetchAttestation(60_000);
      } catch (error) {
        attemptCount++;
        // Wait between attempts
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }

    if (!attestation) {
      throw new Error("Attestation not available after maximum polling attempts");
    }

    // Complete transfer on destination chain
    const destTxIds = await transfer.completeTransfer(destSigner.signer);

    // Return success with transaction details
    return {
      isSuccess: true,
      sourceTransactions: sourceTxIds,
      destinationTransactions: destTxIds,
      transferId: transfer.txids[0],
    };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
};