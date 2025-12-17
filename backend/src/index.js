import express from 'express';
import { PORT } from './config/serverConfig.js';
console.log(PORT)
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.get('/ping', (req, res) => {
    return res.json({ message: 'pong' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});