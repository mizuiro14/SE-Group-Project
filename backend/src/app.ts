import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 

import userRoutes from './routes/userRoute';
import authRoutes from './routes/authRoute';
import productRoutes from './routes/productRoute';
import orderRoutes from './routes/orderRoute';

const app: Application = express();

app.use(express.json());
app.use(cookieParser()); 

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

export default app;