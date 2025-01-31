import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ response: "Hola, soy un bot" });
});

router.post('/', (req: Request, res: Response) => {
    const userInput = req.body.message;
    // Aquí procesarás la entrada del usuario y generarás una respuesta
    res.json({ response: "Respuesta del bot" });
});

export default router;