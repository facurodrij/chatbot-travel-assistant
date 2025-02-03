import { RunnableConfig } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";
import { AgentState } from "../graph.js";
import { destination_agent } from "../agents/destinationAgent";

export const destinationNode = async (
    state: typeof AgentState.State,
    config?: RunnableConfig,
) => {
    const result = await destination_agent.invoke(state, config);
    const lastMessage = result.messages[result.messages.length - 1];
    return {
        messages: [
            new HumanMessage({ content: lastMessage.content, name: "DestinationExpert" }),
        ],
    };
};