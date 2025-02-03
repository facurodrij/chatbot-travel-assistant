import { RunnableConfig } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";
import { AgentState } from "../graph.js";
import { packing_agent } from "../agents/packingAgent";

// Nodo de procesamiento para el agente de equipaje y clima
export const packingNode = async (
    state: typeof AgentState.State,
    config?: RunnableConfig,
) => {
    const result = await packing_agent.invoke(state, config);
    const lastMessage = result.messages[result.messages.length - 1];
    return {
        messages: [
            new HumanMessage({ content: lastMessage.content, name: "PackingExpert" }),
        ],
    };
};