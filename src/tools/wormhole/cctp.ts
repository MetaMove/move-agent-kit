import { wormhole, CircleTransfer, amount } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import sui from "@wormhole-foundation/sdk/sui";
import aptos from "@wormhole-foundation/sdk/aptos";
import { AptosCctpTransferRequest } from "./types";
import { getSigner } from "./helper";

/**
 * Sleep utility function for implementing delays
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced USDC transfer function with retry logic for handling service overload
 * 
 * Executes USDC transfers across blockchains using Circle's Cross-Chain Transfer Protocol (CCTP)
 * via the Wormhole bridge infrastructure from Aptos. Includes retry logic with exponential backoff.
 * 
 * @param request - Object containing transfer configuration (destination chain, amount, network)
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @param initialBackoff - Initial backoff time in milliseconds (default: 2000)
 * @returns Object with detailed transfer status and transaction information
 */
export const transferUsdcWithCctp = async (
  request: AptosCctpTransferRequest,
  maxRetries = 5,
  initialBackoff = 2000
) => {
  const { targetChain, transferAmount, networkType = "Mainnet" } = request;
  
  // Source chain is fixed to Aptos
  const sourceChainId = "Aptos";
  
  // Set transfer mode (manual vs automatic)
  const useAutomatic = false;
  
  // Native gas amount for destination chain (0 for manual transfers)
  const nativeGasAmount = 0;
  
  let retryCount = 0;
  let backoffTime = initialBackoff;

  while (retryCount <= maxRetries) {
    try {
      // If we're retrying, log the attempt
      if (retryCount > 0) {
        //console.log(`Retry attempt ${retryCount}/${maxRetries} after ${backoffTime}ms delay`);
      }
      
      // Initialize Wormhole SDK with blockchain adapters
      const whInstance = await wormhole(networkType, [evm, solana, sui, aptos], {
        chains:{
          Base:{
            rpc: "https://base-mainnet.g.alchemy.com/v2/LQJAkg_rXWdGinhD1VApyddbtt5lBz-R"
          },
          Ethereum:{
            rpc: "https://eth-mainnet.g.alchemy.com/v2/LQJAkg_rXWdGinhD1VApyddbtt5lBz-R"
          }
        }
      });
      //console.log("Wormhole instance initialized");
      
      // Get chain contexts for source and destination
      const sourceChain = whInstance.getChain(sourceChainId);
      //console.log(`Source chain (${sourceChainId}) context retrieved`);
      
      const destChain = whInstance.getChain(targetChain);
      //console.log(`Destination chain (${targetChain}) context retrieved`);
      
      // Get signers for both chains
      const sourceSigner = await getSigner(sourceChain);
      //console.log(`Source signer created: ${sourceSigner.address.address.toString()}`);
      
      const destSigner = await getSigner(destChain);
      //console.log(`Destination signer created: ${destSigner.address.address.toString()}`);
      
      // Parse USDC amount with 6 decimal precision
      const amt = amount.units(amount.parse(transferAmount, 6));
      //console.log(`Transfer amount: ${transferAmount} USDC (${amt} base units)`);
      
      // Calculate native gas amount for automatic transfers (if enabled)
      const nativeGas =
        useAutomatic && nativeGasAmount
          ? amount.units(amount.parse(nativeGasAmount, 6))
          : 0n;
      
      // Create Circle USDC transfer
      //console.log("Creating Circle transfer...");
      const circleTransfer = await whInstance.circleTransfer(
        amt,
        sourceSigner.address,
        destSigner.address,
        useAutomatic,
        undefined, // No custom payload
        nativeGas,
      );
      //console.log("Cirlce Transfer", circleTransfer)
      
      // Get transfer cost estimate
      //console.log("Getting transfer quote...");
      const transferQuote = await CircleTransfer.quoteTransfer(
        sourceSigner.chain,
        destSigner.chain,
        circleTransfer.transfer,
      );
      // console.log('Transfer quote:', {
      //   ...transferQuote,
      //   sourceGasFee: transferQuote,
      //   destinationGasFee: transferQuote,
      //   totalGasFee: transferQuote
      // });
      
      // Initiate transfer on source chain
      //console.log('Starting Transfer');
      const sourceTxIds = await circleTransfer.initiateTransfer(sourceSigner.signer);
      //console.log(`Started Transfer: ${JSON.stringify(sourceTxIds)}`);
      
      // For manual transfers, handle attestation and completion
      
      // Wait for Circle attestation with longer timeout due to potential network congestion
      const timeout = 180 * 1000; // Increased timeout to 3 minutes
      //console.log('Waiting for Attestation');
      const attestationIds = await circleTransfer.fetchAttestation(timeout);
      //console.log(`Got Attestation: ${JSON.stringify(attestationIds)}`);
      
      // Complete transfer on destination chain
      //console.log('Completing Transfer');
      const destTxIds = await circleTransfer.completeTransfer(destSigner.signer);
      //console.log(`Completed Transfer: ${JSON.stringify(destTxIds)}`);
      
      // Return success response with transaction details
      return {
        isSuccess: true,
        status: "Completed",
        sourceChain: sourceChainId,
        destinationChain: targetChain,
        amount: transferAmount,
        sourceTransactions: sourceTxIds,
        attestationIds: attestationIds,
        destinationTransactions: destTxIds,
        automatic: false,
        retryCount: retryCount, // Include retry info in the response
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      //console.error(`Transfer error: ${errorMessage}`);
      
      // Check if error is related to overload or connectivity
      const isOverloadedError = 
        errorMessage.includes("Overloaded") || 
        errorMessage.includes("overloaded") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("429") || // Too Many Requests HTTP code
        errorMessage.includes("connection"); 
      
      // If we've reached max retries or it's not an overload error, stop retrying
      if (retryCount >= maxRetries || !isOverloadedError) {
        return {
          isSuccess: false,
          errorMessage: errorMessage,
          retryAttempts: retryCount,
        };
      }
      
      // Increment retry counter and apply exponential backoff with some jitter
      retryCount++;
      const jitter = Math.random() * 0.3 + 0.85; // Random between 0.85 and 1.15
      backoffTime = Math.min(initialBackoff * Math.pow(2, retryCount) * jitter, 60000); // Cap at 1 minute
      
      //console.log(`Service overloaded. Retrying in ${Math.round(backoffTime)}ms...`);
      await sleep(backoffTime);
    }
  }
  
  // This shouldn't be reached but added for safety
  return {
    isSuccess: false,
    errorMessage: "Max retries reached",
    retryAttempts: retryCount,
  };
};