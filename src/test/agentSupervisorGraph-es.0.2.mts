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

const tavilyTool = new TavilySearchResults({ maxResults: 3 });

// Create Agent Supervisor

import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

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
    stateModifier: new SystemMessage(
        "Eres un experto en destinos de viajes." +
        "Revisa que la información ingresada por el usuario incluya un destino válido (ciudad, país, etc.)." +
        "Puedes usar el motor de búsqueda de Tavily para encontrar información sobre destinos." +
        "Proporciona sugerencias y lugares populares para visitar en el destino." +
        "Si es necesario, puedes solicitar información adicional al usuario." +
        "(Opcional) Si el usuario brinda un presupuesto, sugiere actividades y lugares que se ajusten a él."
    ),
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

import { tool } from "@langchain/core/tools";


//const simpleToolSchema: StructuredToolParams = {
//  name: "get_current_weather",
//  description: "
//  schema: z.object({
//    city: z.string().describe("The city to get the weather for"),
//    state: z.string().optional().describe("The state to get the weather for"),
//  }),
//};

const weatherTool = tool(
    async (input): Promise<string> => {
        try {
            // Se obtiene la información del clima de los próximos 5 días.
            // https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
            const lat = input.lat;
            const lon = input.lon;
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
            );
            const data = await response.json();
            const data_to_string = JSON.stringify(data);
            return data_to_string;
        } catch (error) {
            console.log(error);
            return "Ocurrió un error al obtener la información del clima.";
        }
    },
    {
        name: "openweathermap",
        description: "Obtener información del clima de los próximos 5 días utilizando OpenWeatherMap.",
        schema: z.object({
            lat: z.number().describe("La latitud para obtener el clima"),
            lon: z.number().describe("La longitud para obtener el clima")
        }),
    }
);

const packing_agent = createReactAgent({
    // Especialista en equipaje y clima.
    // Sugerencias para empacar: Según el destino y la duración del viaje, el bot debe generar una lista básica de cosas para llevar. Consulta de clima: Obtener información del clima utilizando una API pública gratuita (por ejemplo, OpenWeatherMap) para el destino y la fecha proporcionados.
    llm,
    tools: [weatherTool],
    stateModifier: new SystemMessage(
        "Eres un experto en equipaje y clima." +
        "Proporciona sugerencias para empacar según el destino y la duración del viaje." +
        "Revisa que la información ingresada por el usuario incluya una fecha válida." +
        "Si la fecha actual y la fecha ingresada superan los 5 días, describe el clima general en la fecha ingresada." +
        "Puedes usar la API de OpenWeatherMap para obtener información sobre el clima de los próximos 5 días." +
        "Si es necesario, puedes solicitar información adicional al usuario.",
    ),
    //"You can use the Tavily search engine to find information about packing." +
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

/* let results = await graph.invoke({
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

console.log(results); */

let streamResults = graph.stream(
    {
        messages: [
            new HumanMessage({
                content: "Quiero ir a París, Francia. ¿Qué lugares debería visitar?",
                //content: "I want to go to Paris, France on February 14th, 2025. What places should I visit? What should I pack?",
            }),
        ],
    },
    { recursionLimit: 50, configurable: { thread_id: "1" } },
);

for await (const output of await streamResults) {
    if (!output?.__end__) {
        console.log(output);
        console.log("----");
    }
}

streamResults = graph.stream(
    {
        messages: [
            new HumanMessage({
                content: "Quiero ir el 3 de febrero de 2025. ¿Cómo estará el clima y qué debo empacar?",
                //content: "¿Cómo está el clima allí?",
            }),
        ],
    },
    { recursionLimit: 50, configurable: { thread_id: "1" } },
);

for await (const output of await streamResults) {
    if (!output?.__end__) {
        console.log(output);
        console.log("----");
    }
}

streamResults = graph.stream(
    {
        messages: [
            new HumanMessage({
                content: "Mi presupuesto es de USD$3000 y quiero quedarme 7 días",
            }),
        ],
    },
    { recursionLimit: 50, configurable: { thread_id: "1" } },
);

for await (const output of await streamResults) {
    if (!output?.__end__) {
        console.log(output);
        console.log("----");
    }
}