import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 1000
});

const tavilyTool = new TavilySearchResults({ maxResults: 3 });

export const destination_agent = createReactAgent({
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
    )
});