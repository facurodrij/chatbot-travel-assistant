import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { openweathermap } from "../tools/openWeatherMap";

// --------------------------------------------------
// Agente de Equipaje y Clima
// --------------------------------------------------
/**
 * Experto en preparación de equipaje:
 * - Sugiere artículos basados en destino y duración
 * - Consulta clima usando OpenWeatherMap
 * - Valida fechas de viaje
 * - Proporciona recomendaciones específicas
 */
const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 1000
});

export const packing_agent = createReactAgent({
    llm,
    tools: [openweathermap],
    stateModifier: new SystemMessage(
        "Eres un experto en equipaje y clima." +
        "Proporciona sugerencias para empacar según el destino y la duración del viaje." +
        "Revisa que la información ingresada por el usuario incluya una fecha válida." +
        "Si la fecha actual y la fecha ingresada superan los 5 días, describe el clima general en la fecha ingresada." +
        "Puedes usar la API de OpenWeatherMap para obtener información sobre el clima de los próximos 5 días." +
        "Si es necesario, puedes solicitar información adicional al usuario.",
    )
});
