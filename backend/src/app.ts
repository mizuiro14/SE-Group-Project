import express, { Application } from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoute';

const app: Application = express();

app.use(express.json());
app.use(cors());


export default app;