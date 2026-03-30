import express, { Application } from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoute';
import authRoutes from './routes/authRoute';
import productRoutes from './routes/productRoute';

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

export default app;