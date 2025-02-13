import { END, START, StateGraph } from "@langchain/langgraph"
import { aptosReadNode } from "./agents/aptos-read-agent"
import { managerNode, managerRouter } from "./agents/manager"
import { writerNode, writerTool } from "./agents/tweet-writer-agent"
import { postNode, postOnXTool } from "./agents/x-post-agent"
import { StateAnnotation } from "./state"

const workflow = new StateGraph(StateAnnotation)
	.addNode("manager", managerNode)
	.addNode("aptosRead", aptosReadNode)
	.addNode("tweetWriter", writerNode)
	.addNode("postOnTwitter", postNode)
	.addEdge("tweetWriter", "postOnTwitter")
	.addEdge("aptosRead", "tweetWriter")
	.addEdge("aptosRead", "postOnTwitter")
	.addEdge(START, "manager")
	.addConditionalEdges("manager", managerRouter)
	//.addEdge("aptosRead", END)
	//.addEdge("tweetWriter", END)
	// TODO: need to make sure the prompts recognize postOnTwitter tool before uncommenting above 2 lines
	.addEdge("postOnTwitter", END)


export const graph = workflow.compile()
