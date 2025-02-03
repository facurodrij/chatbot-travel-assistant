import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { openweathermap } from "../tools/openWeatherMap";

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 1000
});

export const packing_agent = createReactAgent({
    // Especialista en equipaje y clima.
    // Sugerencias para empacar: Según el destino y la duración del viaje, el bot debe generar una lista básica de cosas para llevar. Consulta de clima: Obtener información del clima utilizando una API pública gratuita (por ejemplo, OpenWeatherMap) para el destino y la fecha proporcionados.
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
