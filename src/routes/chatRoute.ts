import { Request, Response, Router } from 'express';
import { HumanMessage } from '@langchain/core/messages';
import { graph } from '../graph';

// Definir las interfaces de la salida de la función stream
interface Message {
    lc: number;
    type: string;
    id: string[];
    kwargs: {
        content: string;
        name: string;
        additional_kwargs: Record<string, unknown>;
        response_metadata: Record<string, unknown>;
    };
};

interface Destination {
    messages: Message[];
};

interface Packing {
    messages: Message[];
};

interface Item {
    destination?: Destination;
    packing?: Packing;
};


const router = Router();

router.get('/', (res: Response) => {
    res.json({
        response: "Hola, soy un asistente de viajes. Para que pueda ayudarte, " +
            "necesito que ingreses un destino, fecha de llegada y opcionalmente un presupuesto."
    });
});

router.post('/', async (req: Request, res: Response) => {
    const userInput = req.body.message;
    if (!userInput) {
        res.status(400).json({ error: "No se ha proporcionado un mensaje." });
        return;
    };
    try {
        const outputs = await getStreamResults(userInput);
        const items = filterAndParseOutputs(outputs);
        const response = generateResponse(items);
        res.status(200).json({ "response": response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ha ocurrido un error al procesar la solicitud." });
    }
});

// Función para obtener los resultados del stream
async function getStreamResults(userInput: string) {
    const streamResults = graph.stream(
        {
            messages: [
                new HumanMessage({
                    content: userInput,
                }),
            ],
        },
        { recursionLimit: 50, configurable: { thread_id: "1" } },
    );
    const outputs = [];
    for await (const output of await streamResults) {
        outputs.push(output);
    }
    return outputs;
};

// Función para filtrar y parsear los resultados del stream
function filterAndParseOutputs(outputs: any[]): Item[] {
    return JSON.parse(JSON.stringify(
        outputs.filter(item =>
            !('supervisor' in item) &&
            (item.destination || item.packing)
        )
    ));
};

// Función para generar la respuesta a partir de los items
function generateResponse(items: Item[]): string {
    let response = "";

    items.forEach((item) => {
        if (item.destination) {
            item.destination.messages.forEach((message) => {
                response += message.kwargs.content;
            });
        } else if (item.packing) {
            item.packing.messages.forEach((message) => {
                response += message.kwargs.content;
            });
        }
    });
    return response;
};

export default router;