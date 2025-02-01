// process.env.OPENAI_API_KEY = "sk_...";
// process.env.TAVILY_API_KEY = "sk_...";
// Optional tracing in LangSmith
// process.env.LANGCHAIN_API_KEY = "sk_...";
// process.env.LANGCHAIN_TRACING_V2 = "true";
// process.env.LANGCHAIN_PROJECT = "Agent Supervisor: LangGraphJS";

import "dotenv/config";

import { END, Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// This defines the object that is passed between each node
// in the graph. We will create different nodes for each agent and tool
const AgentState = Annotation.Root({
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

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { z } from "zod";

const tavilyTool = new TavilySearchResults();

// Create Agent Supervisor

import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const members = ["destination", "packing"] as const;

const systemPrompt =
    "You are a supervisor tasked with managing a conversation between the" +
    " following workers: {members}. Given the following user request," +
    " respond with the worker to act next. Each worker will perform a" +
    " task and respond with their results and status. When finished," +
    " respond with FINISH.";
const options = [END, ...members];

// Define the routing function
const routingTool = {
    name: "route",
    description: "Select the next role.",
    schema: z.object({
        next: z.enum([END, ...members]),
    }),
}

const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
    [
        "human",
        "Given the conversation above, who should act next?" +
        " Or should we FINISH? Select one of: {options}",
    ],
]);

const formattedPrompt = await prompt.partial({
    options: options.join(", "),
    members: members.join(", "),
});

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

const supervisorChain = formattedPrompt
    .pipe(llm.bindTools(
        [routingTool],
        {
            tool_choice: "route",
        },
    ))
    // select the first one
    .pipe((x) => (x.tool_calls && x.tool_calls[0] ? x.tool_calls[0].args : undefined));

// Construct Graph

import { RunnableConfig } from "@langchain/core/runnables";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const destination_agent = createReactAgent({
    // Experto en destinos (sugerencias, lugares populares, etc.)
    // Búsqueda de destinos: Permite al usuario explorar destinos con detalles básicos (nombre, ubicación, y una descripción breve).
    llm,
    tools: [tavilyTool],
    stateModifier: new SystemMessage("You are a destination expert. You can use the Tavily search engine to find information about destinations.")
})

const destinationNode = async (
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

const packing_agent = createReactAgent({
    // Especialista en equipaje y clima.
    // Sugerencias para empacar: Según el destino y la duración del viaje, el bot debe generar una lista básica de cosas para llevar. Consulta de clima: Obtener información del clima utilizando una API pública gratuita (por ejemplo, OpenWeatherMap) para el destino y la fecha proporcionados.
    llm,
    tools: [tavilyTool],
    stateModifier: new SystemMessage("You are a packing expert. You can use the Tavily search engine to find information about packing. You can also use the OpenWeatherMap API to find information about the weather at a destination.")
})

const packingNode = async (
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

// Define the graph

import { START, StateGraph } from "@langchain/langgraph";

// 1. Create the graph
const workflow = new StateGraph(AgentState)
    // 2. Add the nodes; these will do the work
    //.addNode("researcher", researcherNode)
    //.addNode("chart_generator", chartGenNode)
    .addNode("destination", destinationNode)
    .addNode("packing", packingNode)
    .addNode("supervisor", async (state: typeof AgentState.State, config?: RunnableConfig) => {
        const result = await supervisorChain.invoke(state, config);
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

const graph = workflow.compile({ checkpointer: memorySaver });

// Run the graph

let results = await graph.invoke({
    messages: [new HumanMessage({
        content: "I want to go to Paris, France. What places should I visit?",
    })]
},
    {
        configurable: { thread_id: "42" }
    });

console.log(results);
console.log("----");

results = await graph.invoke({
    messages: [new HumanMessage({
        content: "I want to go on February 14th, 2025. What should I pack?",
    })],
},
    {
        configurable: { thread_id: "42" }
    });

console.log(results);