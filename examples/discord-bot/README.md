# Discord Bot

A Discord bot that leverages the Move Agent Kit to interact with the Aptos blockchain. Users can send direct messages to the bot, which processes their requests and can perform blockchain operations using a controlled wallet.

## Overview

This bot acts as an interface between Discord users and the Aptos blockchain, allowing for on-chain interactions through conversational prompts. It uses Google's Gemini AI model for natural language understanding and the Move Agent Kit to execute blockchain operations.

## Features

- Responds to Discord direct messages
- Uses Google's Gemini 2.0 Flash model for natural language processing
- Connects to the Aptos mainnet
- Can execute blockchain transactions
- Maintains conversation history for each user

## Prerequisites

- Node.js (v16 or higher recommended)
- Discord account and bot token
- Google Generative AI API key
- Aptos wallet with private key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DISCORD_BOT_TOKEN=your_discord_bot_token
GOOGLE_API_KEY=your_google_api_key
APTOS_PRIVATE_KEY=your_aptos_private_key
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/aptos-discord-bot.git
   cd aptos-discord-bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create and configure the `.env` file as described above

4. Start the bot:
   ```
   npm start
   ```

## Dependencies

- discord.js: Discord API client
- @langchain/core: Core LangChain functionality
- @langchain/langgraph: Agent framework
- @langchain/google-genai: Google Generative AI integration
- move-agent-kit: Tools for Aptos blockchain interaction
- @aptos-labs/ts-sdk: Aptos blockchain SDK
- dotenv: Environment variable management

## Usage

1. Add the bot to your Discord server
2. Send a direct message to the bot
3. The bot will process your request using AI and respond with appropriate actions
4. For blockchain operations, the bot will use the configured Aptos wallet

## Example Interactions

- "Show my wallet balance"
- "What is my wallet address"
- "Transfer 1 APT to address 0x123..."
- "Stake 1 APT in Thala protocol"

## Security Considerations

- The bot uses a private key stored in the environment variables, which controls an Aptos wallet
- Never share your `.env` file or expose your private keys
- Consider using a dedicated wallet with limited funds for the bot

## Troubleshooting

- If the bot doesn't respond, check the console logs for errors
- For 5XX errors from the Aptos API, try again later
- Ensure your Discord bot has the "Message Content Intent" enabled in the Discord Developer Portal

