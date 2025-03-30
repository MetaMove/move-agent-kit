import 'dotenv/config';
import { Client, GatewayIntentBits, Events, ChannelType, Partials } from 'discord.js';
import { HumanMessage } from '@langchain/core/messages';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AgentRuntime, createAptosTools, LocalSigner } from "move-agent-kit";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";

const client = new Client({
    intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Message, Partials.Channel],
  });
  
const chatHistory = new Map();


async function initializeAgent() {
  try {
    const llm = new ChatGoogleGenerativeAI({
      temperature: 0.7,
      model: "gemini-2.0-flash", 
    });

    const aptosConfig = new AptosConfig({ network: Network.MAINNET });
    const aptos = new Aptos(aptosConfig);
    const privateKeyStr=process.env.APTOS_PRIVATE_KEY
    if (!privateKeyStr) {
      throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
    }

    const account = await aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(
        PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)
      ),
    });

    const signer = new LocalSigner(account, Network.MAINNET);
    const agentRuntime = new AgentRuntime(signer, aptos);

    const tools = createAptosTools(agentRuntime);
    const memorySaver = new MemorySaver();

    const config = { configurable: { thread_id: 'Discord Bot' } };

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memorySaver,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Move Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. Otherwise, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Move Agent Kit. For more information, please visit https://metamove.build/move-agent-kit. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless explicitly requested.
      `,
    });

    return { agent, config };
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    throw error;
  }
}



client.on(Events.ClientReady, async () => {
  await client.application?.fetch();
  console.info(`${client.user?.username || 'Bot'} is running. Send it a message in Discord DM to get started.`);
});

client.on(Events.MessageCreate, async (message:any) => {
  try {
    if (message.channel.type !== ChannelType.DM || message.author.bot) return;

    console.info(`Received message: ${message.content}`);
    await message.channel.sendTyping();

    const { agent, config } = await initializeAgent();
    const userId = message.author.id;
    if (!chatHistory.has(userId)) {
      chatHistory.set(userId, []);
    }
    console.info(userId)
    const userChatHistory = chatHistory.get(userId);

    if (message.content.trim() !== '') {
      userChatHistory.push(new HumanMessage(message.content));
    } else {
      console.error('Received an empty message. Ignoring.');
      return;
    }

    const stream = await agent.stream({ messages: userChatHistory }, config);
    console.info(stream)

    

    let resultText = "";
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        resultText += "Agent:" + chunk.agent.messages[0].content + "\n";
      }
    }
    console.log(resultText);


    function getSubstringAfterNthOccurrence(str:string, delimiter:string, n:number) {
      let pos = -1;
      for (let i = 0; i < n; i++) {
        pos = str.indexOf(delimiter, pos + 1);
        if (pos === -1) {
          return ""; // Return empty string if the delimiter doesn't occur n times
        }
      }
      return str.substring(pos + delimiter.length);
    }
    
    // Extract content after the second occurrence of "Agent:"
    const messageToSend = getSubstringAfterNthOccurrence(resultText, "Agent:", 2).trim();
    if (messageToSend) {
      await message.reply(messageToSend);
      userChatHistory.push(new HumanMessage(messageToSend));
    } else {
      
      const firstResponse = getSubstringAfterNthOccurrence(resultText, "Agent:", 1).trim();
      if (firstResponse) {
        await message.reply(firstResponse);
        userChatHistory.push(new HumanMessage(firstResponse));
      } else {
        console.error("No agent response found in resultText.");
        await message.reply("I'm ready to help with your Aptos wallet. What would you like to do?");
      }
    }
    
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
