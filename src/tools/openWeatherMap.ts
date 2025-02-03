import { z } from "zod";
import { tool } from "@langchain/core/tools";

export const openweathermap = tool(
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