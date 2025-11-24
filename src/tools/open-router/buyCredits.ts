import { Network, Chain } from "@wormhole-foundation/sdk";
import { base } from 'viem/chains';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { USDC_ADDRESS, USDC_DECIMALS } from './constants';
import { COINBASE_COMMERCE_ABI } from '../../utils/coinbase-commerce';
import type { AgentRuntime } from "../../agent"
import { encodeFunctionData, erc20Abi, formatUnits } from 'viem';
import { constructBaseScanUrl } from './supportedChains';

// OpenRouter types
type OpenRouterTransferIntentResponse = {
  data: {
    id: string;
    created_at: string;
    expires_at: string;
    web3_data: {
      transfer_intent: {
        metadata: {
          chain_id: number;
          contract_address: string;
          sender: string;
        };
        call_data: {
          recipient_amount: string;
          deadline: string;
          recipient: string;
          recipient_currency: string;
          refund_destination: string;
          fee_amount: string;
          id: string;
          operator: string;
          signature: string;
          prefix: string;
        };
      };
    };
  };
};

/**
 * Interface for the request to buy OpenRouter credits
 */
export interface BuyOpenRouterCreditsRequest {
  amountUsd: number;
  networkType: Network;
}

/**
 * Format private key to ensure it's properly formatted for viem
 * 
 * @param privateKey - The private key to format
 * @returns Properly formatted private key
 */
function formatPrivateKey(privateKey: string): `0x${string}` {
  // Strip any whitespace
  let formattedKey = privateKey.trim();
  
  // Add 0x prefix if not present
  if (!formattedKey.startsWith('0x')) {
    formattedKey = `0x${formattedKey}`;
  }
  
  // Ensure the key is 32 bytes (64 characters after 0x)
  if (formattedKey.length !== 66) {
    console.error(`Private key has incorrect length: ${formattedKey.length}. Expected 66 characters including 0x prefix.`);
    throw new Error('Invalid private key length');
  }
  
  // Validate that it contains only hex characters
  if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
    throw new Error('Private key contains invalid characters, expected hexadecimal format');
  }
  
  return formattedKey as `0x${string}`;
}

/**
 * Buy OpenRouter credits by first transferring USDC from Aptos to Base and then using Base to purchase credits
 * 
 * @param agent - The agent runtime
 * @param request - Object containing the amount in USD and network type
 * @returns Transaction information including hash and URL
 */
export async function buyOpenRouterCredits(
  agent: AgentRuntime,
  request: BuyOpenRouterCreditsRequest
): Promise<string> {
  const { amountUsd, networkType = "Mainnet" } = request;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  if (!process.env.ETH_PRIVATE_KEY) {
    throw new Error('ETH_PRIVATE_KEY is not set for Base chain');
  }
  
  // Log the first few characters of the private key for debugging (never log the full key)
  const privateKeyPreview = process.env.ETH_PRIVATE_KEY.substring(0, 6) + '...';
  console.log(`Using ETH_PRIVATE_KEY starting with: ${privateKeyPreview}`);

  // Step 1: Transfer USDC from Aptos to Base using CCTP
  console.log(`Transferring ${amountUsd} USDC from Aptos to Base...`);
  
  let cctpResult;
  try {
    // First verify the user has enough USDC on Aptos
    const aptosUsdcBalance = await agent.getBalance("0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b");
    
    if (!aptosUsdcBalance || aptosUsdcBalance < amountUsd) {
      throw new Error(`Insufficient USDC balance on Aptos. Required: ${amountUsd}, Available: ${aptosUsdcBalance || 0}`);
    }
    
    // Perform the CCTP transfer
    cctpResult = await agent.transferUsdcWithCctp("Base", amountUsd.toString(), networkType);
    
    if (!cctpResult.isSuccess) {
      throw new Error(`CCTP transfer failed: ${cctpResult.errorMessage || "Unknown error"}`);
    }
    
    console.log("CCTP transfer successful:", cctpResult);
  } catch (error: any) {
    throw new Error(`USDC transfer from Aptos to Base failed: ${error.message}`);
  }

  // Step 2: Initialize the Base wallet and client
  let baseAccount;
  try {
    // Format and validate the private key
    const formattedPrivateKey = formatPrivateKey(process.env.ETH_PRIVATE_KEY);
    console.log("Private key properly formatted");
    
    // Create the account from the formatted private key
    baseAccount = privateKeyToAccount(formattedPrivateKey);
    console.log(`Successfully created account with address: ${baseAccount.address}`);
  } catch (error: any) {
    console.error("Error creating Base account:", error);
    throw new Error(`Failed to create Base wallet: ${error.message}`);
  }
  
  // Create wallet and public clients
  const walletClient = createWalletClient({
    account: baseAccount,
    chain: base,
    transport: http("https://base-mainnet.g.alchemy.com/v2/LQJAkg_rXWdGinhD1VApyddbtt5lBz-R"),
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http("https://base-mainnet.g.alchemy.com/v2/LQJAkg_rXWdGinhD1VApyddbtt5lBz-R"),
  });

  console.log(`Using Base wallet address: ${baseAccount.address}`);

  // Step 3: Check if the wallet has enough USDC on Base
  // Add delay to allow for CCTP finalization
  console.log("Waiting 15 seconds for CCTP finalization...");
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  let usdcBalance;
  try {
    usdcBalance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [baseAccount.address],
    });

    const parsedUnits = formatUnits(usdcBalance, USDC_DECIMALS);
    console.log(`Base wallet has ${parsedUnits} USDC`);

    if (Number(parsedUnits) < amountUsd) {
      // If balance is insufficient, wait longer and try again
      console.log(`Insufficient balance. Waiting 30 more seconds for CCTP finalization...`);
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      usdcBalance = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [baseAccount.address],
      });
      
      const newParsedUnits = formatUnits(usdcBalance, USDC_DECIMALS);
      console.log(`Base wallet now has ${newParsedUnits} USDC`);
      
      if (Number(newParsedUnits) < amountUsd) {
        throw new Error(`Insufficient USDC balance on Base after transfer. Required: ${amountUsd}, Available: ${newParsedUnits}`);
      }
    }
    
    console.log(`Base wallet has ${formatUnits(usdcBalance, USDC_DECIMALS)} USDC, ready to purchase credits`);
  } catch (error: any) {
    console.error(`USDC balance check error:`, error);
    throw new Error(`Failed to check USDC balance on Base: ${error.message}`);
  }

  // Step 4: Purchase OpenRouter credits
  try {
    console.log(`Preparing to buy ${amountUsd} OpenRouter credits from address ${baseAccount.address}`);
    
    // Fetch the transfer intent from OpenRouter
    const response = await fetch(
      'https://openrouter.ai/api/v1/credits/coinbase',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountUsd,
          sender: baseAccount.address,
          chain_id: base.id,
        }),
      },
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error:`, errorText);
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }
    
    const responseJSON: OpenRouterTransferIntentResponse = await response.json();
    console.log("OpenRouter response:", JSON.stringify(responseJSON, null, 2));
    
    const {
      data: {
        web3_data: {
          transfer_intent: { call_data, metadata },
        },
      },
    } = responseJSON;

    console.log("Got transfer intent from OpenRouter");
    console.log("Contract address:", metadata.contract_address);
    console.log("Recipient amount:", call_data.recipient_amount);
    console.log("Fee amount:", call_data.fee_amount);

    // Generate transactions based off intent
    const atomicUnits =
      BigInt(call_data.recipient_amount) + BigInt(call_data.fee_amount);

    const approvalTxCalldata = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [
        metadata.contract_address as `0x${string}`,
        atomicUnits,
      ],
    });

    // Ensure we have a valid contract address
    if (!metadata.contract_address || !metadata.contract_address.startsWith('0x')) {
      throw new Error(`Invalid contract address from OpenRouter: ${metadata.contract_address}`);
    }

    const transferTokenPreApprovedTxCalldata = encodeFunctionData({
      abi: COINBASE_COMMERCE_ABI,
      functionName: 'transferTokenPreApproved',
      args: [
        {
          id: call_data.id as `0x${string}`,
          deadline: BigInt(
            Math.floor(new Date(call_data.deadline).getTime() / 1000),
          ),
          recipient: call_data.recipient as `0x${string}`,
          recipientAmount: BigInt(call_data.recipient_amount),
          recipientCurrency: call_data.recipient_currency as `0x${string}`,
          refundDestination: call_data.refund_destination as `0x${string}`,
          feeAmount: BigInt(call_data.fee_amount),
          operator: call_data.operator as `0x${string}`,
          signature: call_data.signature as `0x${string}`,
          prefix: call_data.prefix as `0x${string}`,
        },
      ],
    });

    // Execute the approval transaction
    console.log("Sending USDC approval transaction to", USDC_ADDRESS);
    const approval = await walletClient.sendTransaction({
      to: USDC_ADDRESS,
      data: approvalTxCalldata,
      account: baseAccount,
    });

    console.log(`Approval transaction hash: ${approval}`);
    const approvalReceipt = await publicClient.waitForTransactionReceipt({
      hash: approval,
    });
    
    console.log("Approval transaction confirmed", approvalReceipt.status);

    // Small delay after approval
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Execute the transfer transaction
    console.log("Sending transfer transaction to", metadata.contract_address);
    const transfer = await walletClient.sendTransaction({
      to: metadata.contract_address as `0x${string}`,
      data: transferTokenPreApprovedTxCalldata,
      account: baseAccount,
    });

    console.log(`Transfer transaction hash: ${transfer}`);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: transfer,
    });

    console.log("Transfer transaction confirmed with status:", receipt.status);

    // Return the transaction information
    return JSON.stringify({
      isSuccess: true,
      hash: receipt.transactionHash,
      url: constructBaseScanUrl(base, receipt.transactionHash),
      amountUsd,
    });
  } catch (error: any) {
    console.error("Error in OpenRouter credits purchase:", error);
    
    if (error.message.includes("User rejected the request")) {
      throw new Error("Transaction was rejected by the wallet");
    }
    
    if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient ETH for gas fees on Base chain");
    }
    
    // Check for other common errors
    throw new Error(`Failed to purchase OpenRouter credits: ${error.message}`);
  }
}