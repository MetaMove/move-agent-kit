import { Tool } from "langchain/tools";
import { type AgentRuntime, parseJson } from "../..";

export class BuyOpenRouterCreditsTool extends Tool {
  name = "buy_openrouter_credits";
  description = `This tool can be used to buy OpenRouter credits using USDC from your Aptos wallet.
  It will automatically transfer the USDC from Aptos to Base chain and then purchase the credits.
  
  Inputs (input is a JSON string):
    amountUsd: number, the amount of credits to buy in USD (required)
    networkType: string, eg "Mainnet" or "Testnet" or "Devnet" (optional, defaults to "Mainnet")
  `;

  constructor(private agent: AgentRuntime) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      console.log("Starting OpenRouter credits purchase process");
      const parsedInput = parseJson(input);
      const { amountUsd, networkType = "Mainnet" } = parsedInput;
      
      if (!amountUsd || typeof amountUsd !== "number" || amountUsd <= 0) {
        return JSON.stringify({
          status: "error",
          message: "Invalid amountUsd. Please provide a positive number.",
          code: "INVALID_AMOUNT"
        });
      }
      
      console.log(`Buying ${amountUsd} OpenRouter credits on ${networkType}`);
      
      // Call the buyOpenRouterCredits function
      const result = await this.agent.buyOpenRouterCredits(amountUsd, networkType);
      
      // Parse result to handle both string and object returns
      let parsedResult;
      try {
        parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
      } catch (e) {
        parsedResult = { isSuccess: true, message: result };
      }
      
      // Return standardized result
      return JSON.stringify({
        status: parsedResult.isSuccess ? "success" : "error",
        message: parsedResult.isSuccess 
          ? `Successfully purchased ${amountUsd} OpenRouter credits` 
          : parsedResult.message || "Failed to purchase credits",
        data: parsedResult,
        transactionUrl: parsedResult.url,
      });
    } catch (error: any) {
      console.error("Error in BuyOpenRouterCreditsTool:", error);
      return JSON.stringify({
        status: "error",
        message: error.message || "Unknown error occurred",
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}