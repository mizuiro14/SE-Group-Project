import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoute';
import authRoutes from './routes/authRoute';
import productRoutes from './routes/productRoute';
import orderRoutes from './routes/orderRoute';
import shippingRoutes from './routes/shippingRoute';
import sellerRoutes from './routes/sellerRoute'; // New import
import buyerRoutes from './routes/buyerRoute';   // New import
import imageRoutes from './routes/imageRoute';
import paymentRoutes from './routes/paymentRoute';

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL // We will set this in Render later!
];

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || 'https://i-am-barley.vercel.app'
  ],
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/sellers', sellerRoutes); // New route
app.use('/api/buyers', buyerRoutes);   // New route
app.use('/api/images', imageRoutes);
app.use('/api/payments', paymentRoutes);


export default app;