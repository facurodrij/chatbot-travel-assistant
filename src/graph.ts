import { END, Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableConfig } from "@langchain/core/runnables";
import { START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import { destinationNode } from "./nodes/destinationNode";
import { packingNode } from "./nodes/packingNode";

// This defines the object that is passed between each node
// in the graph. We will create different nodes for each agent and tool
export const AgentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    // The agent node that last performed work
    next: Annotation<string>({
        reducer: (x, y) => y ?? x ?? END,
        default: () => END,
    }),
});

const members = ["destination", "packing"] as const;

const systemPrompt =
    "Tu eres un supervisor encargado de gestionar una conversación entre los" +
    " siguientes agentes: {members}. Dada la solicitud del usuario," +
    " responde con el agente que debe actuar a continuación." +
    " Cada agente realizará una tarea y responderá con sus resultados y estado." +
    " Cuando terminen, responde con FINISH.";

const options = [END, ...members];

// Define the routing function
const routingTool = {
    name: "route",
    description: "Selecciona el siguiente rol.",
    schema: z.object({
        next: z.enum([END, ...members]),
    }),
}

const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
    [
        "human",
        "Dada la conversación anterior, ¿quién debería actuar a continuación?" +
        " ¿O deberíamos TERMINAR? Selecciona uno de: {options}"
    ],
]);


const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

async function supervisorChain() {
    const formattedPrompt = await prompt.partial({
        options: options.join(", "),
        members: members.join(", "),
    });
    return formattedPrompt.pipe(llm.bindTools(
        [routingTool],
        {
            tool_choice: "route",
        },
    ))
        // select the first one
        .pipe((x) => (x.tool_calls && x.tool_calls[0] ? x.tool_calls[0].args : undefined));
}

// Construct Graph
// 1. Create the graph
const workflow = new StateGraph(AgentState)
    // 2. Add the nodes; these will do the work
    .addNode("destination", destinationNode)
    .addNode("packing", packingNode)
    .addNode("supervisor", async (state: typeof AgentState.State, config?: RunnableConfig) => {
        const result = await (await supervisorChain()).invoke(state, config);
        return result;
    });
// 3. Define the edges. We will define both regular and conditional ones
// After a worker completes, report to supervisor
members.forEach((member) => {
    workflow.addEdge(member, "supervisor");
});

workflow.addConditionalEdges(
    "supervisor",
    (x: typeof AgentState.State) => x.next,
);

workflow.addEdge(START, "supervisor");

import { MemorySaver } from "@langchain/langgraph";

const memorySaver = new MemorySaver();

export const graph = workflow.compile({ checkpointer: memorySaver });
