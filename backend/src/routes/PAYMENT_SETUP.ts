import paymentRouter from './routes/paymentRoute';

/**
 * QUICK START: Add this to your app.ts file
 * 
 * This is the minimal setup needed to integrate the payment system
 */

// Add this import at the top of app.ts:
// import paymentRouter from './routes/paymentRoute';

/**
 * Add this middleware registration wherever you register other routes:
 * 
 * Example in app.ts:
 */

export function setupPaymentRoutes(app: any) {
    // Payment API routes
    app.use('/api/payments', paymentRouter);

    console.log('✓ Payment routes registered at /api/payments');
}

/**
 * Example app.ts integration:
 * 
 * import express from 'express';
 * import paymentRouter from './routes/paymentRoute';
 * 
 * const app = express();
 * 
 * // Middleware
 * app.use(express.json());
 * 
 * // Payment routes
 * app.use('/api/payments', paymentRouter);
 * 
 * // Other routes...
 * 
 * export default app;
 */
