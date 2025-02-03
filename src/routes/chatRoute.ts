import { Request, Response, Router } from 'express';
import { HumanMessage } from '@langchain/core/messages';
import { graph } from '../graph.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({
        response: "Hola, soy un asistente de viajes. Para que pueda ayudarte, " +
            "necesito que ingreses un destino, fecha de llegada y opcionalmente un presupuesto."
    });
});

router.post('/', async (req: Request, res: Response) => {
    const userInput = req.body.message;
    if (!userInput) {
        res.json({ response: "No se ingreso un mensaje" }).status(400);
        return;
    };

    let streamResults = graph.stream(
        {
            messages: [
                new HumanMessage({
                    content: userInput,
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

    res.json({ response: "Mensaje recibido" });
});

export default router;