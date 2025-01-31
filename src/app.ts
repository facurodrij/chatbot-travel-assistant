import express from 'express';
import chatRoute from './routes/chatRoute';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/chat', chatRoute);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});