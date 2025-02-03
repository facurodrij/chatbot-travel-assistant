import { z } from "zod";
import { START, END, StateGraph, Annotation, MemorySaver } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableConfig } from "@langchain/core/runnables";
import { destinationNode } from "./nodes/destinationNode";
import { packingNode } from "./nodes/packingNode";

// ==============================================
// Definición del Estado del Grafo
// ==============================================
/**
 * Objeto de estado que se pasa entre los nodos del grafo.
 * Contiene:
 * - messages: Historial de mensajes de la conversación (se concatenan con reducer)
 * - next: Identificador del próximo agente a ejecutar (se actualiza en cada paso)
 */
export const AgentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),  // Acumula mensajes
        default: () => [],               // Valor inicial: array vacío
    }),
    next: Annotation<string>({
        reducer: (x, y) => y ?? x ?? END, // Prioriza nuevo valor, mantiene anterior o finaliza
        default: () => END,              // Valor inicial: nodo final
    }),
});

// Agentes disponibles en el sistema
const members = ["destination", "packing"] as const;

// Prompt del sistema para el supervisor
const systemPrompt =
    "Tu eres un supervisor encargado de gestionar una conversación entre los" +
    " siguientes agentes: {members}. Dada la solicitud del usuario," +
    " responde con el agente que debe actuar a continuación." +
    " Cada agente realizará una tarea y responderá con sus resultados y estado." +
    " Cuando terminen, responde con FINISH.";

// Opciones de routing válidas
const options = [END, ...members];

// ==============================================
// Herramienta de Routing
// ==============================================
/**
 * Herramienta para decidir el siguiente paso en el flujo de conversación
 * Utiliza Zod para validación de esquema:
 * - next: debe ser uno de los agentes o END
 */
const routingTool = {
    name: "route",
    description: "Selecciona el siguiente rol.",
    schema: z.object({
        next: z.enum([END, ...members]),
    }),
}

// ==============================================
// Cadena de Supervisión
// ==============================================
// Plantilla de prompt que incluye el historial de mensajes
const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),  // Marcador para historial de conversación
    [
        "human",
        "Dada la conversación anterior, ¿quién debería actuar a continuación?" +
        " ¿O deberíamos TERMINAR? Selecciona uno de: {options}"
    ],
]);

// LLM configurado con GPT-4 y temperatura 0 para respuestas deterministas
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

// Cadena de procesamiento del supervisor:
// 1. Aplica el prompt con opciones disponibles
// 2. Obliga al modelo a usar la herramienta de routing
// 3. Extrae el resultado de la primera llamada a herramienta
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

// ==============================================
// Construcción del Grafo de Flujo
// ==============================================
const workflow = new StateGraph(AgentState)
    // Registro de nodos
    .addNode("destination", destinationNode)
    .addNode("packing", packingNode)
    .addNode("supervisor", async (state: typeof AgentState.State, config?: RunnableConfig) => {
        return await (await supervisorChain()).invoke(state, config);
    });

// Conexión de agentes al supervisor
members.forEach((member) => {
    workflow.addEdge(member, "supervisor");
});

// Lógica de routing condicional
workflow.addConditionalEdges(
    "supervisor",
    (x: typeof AgentState.State) => x.next,
);

// Inicialización del flujo
workflow.addEdge(START, "supervisor");

// Configuración de persistencia
const memorySaver = new MemorySaver();

// Compilación final del grafo
export const graph = workflow.compile({ checkpointer: memorySaver });
