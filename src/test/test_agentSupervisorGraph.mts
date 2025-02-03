import "dotenv/config";
import { HumanMessage } from "@langchain/core/messages";
import { graph } from "../graph";

// ==============================================
// Ejemplo de Ejecución
// ==============================================
const messages = [
    new HumanMessage("Quiero ir a París, Francia. ¿Qué lugares debería visitar?"),
    new HumanMessage("Quiero ir el 3 de febrero de 2025. ¿Cómo estará el clima y qué debo empacar?"),
    new HumanMessage("Mi presupuesto es de USD$3000 y quiero quedarme 7 días"),
];

// Simulación de flujo de conversación
for (const m of messages) {
    const streamResults = graph.stream(
        { messages: [m] },
        {
            recursionLimit: 50,  // Límite de pasos para prevenir loops infinitos
            configurable: { thread_id: "1" }  // ID de conversación para persistencia
        },
    );

    // Procesamiento de resultados en streaming
    for await (const output of await streamResults) {
        if (!output?.__end__) {
            console.log("Salida del nodo:", output);
            console.log("----");
        }
    }
};