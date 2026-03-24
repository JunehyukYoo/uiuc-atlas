import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({
  origin: ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true })
});

app.get('/api/ping', (_req: Request, res: Response) => {
    res.json('pong')
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});