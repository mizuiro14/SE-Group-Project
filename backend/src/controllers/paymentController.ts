import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { PaymentMethod } from '../types/payment';

export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { order_id, amount, method, metadata } = req.body;

        // Validate required fields
        if (!order_id || !amount || !method) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: order_id, amount, method'
            });
            return;
        }

        // Validate payment method
        if (!Object.values(PaymentMethod).includes(method)) {
            res.status(400).json({
                success: false,
                message: `Invalid payment method. Supported methods: ${Object.values(PaymentMethod).join(', ')}`
            });
            return;
        }

        // Process payment
        const result = await PaymentService.processPayment({
            order_id,
            amount,
            method,
            metadata
        });

        res.status(200).json({
            success: result.response.success,
            payment_id: result.payment.id,
            status: result.payment.status,
            message: result.response.message,
            transaction_id: result.response.transaction_id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error creating payment: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Payment ID is required'
            });
            return;
        }

        const payment = await PaymentService.getPaymentById(parseInt(id));

        res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: `Error retrieving payment: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};

export const getPaymentsByOrderId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;

        if (!orderId || typeof orderId !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
            return;
        }

        const payments = await PaymentService.getPaymentsByOrderId(parseInt(orderId));

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error retrieving payments: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, method, limit, offset } = req.query;

        const filters = {
            status: typeof status === 'string' ? status : undefined,
            method: typeof method === 'string' ? method : undefined,
            limit: limit && typeof limit === 'string' ? parseInt(limit) : undefined,
            offset: offset && typeof offset === 'string' ? parseInt(offset) : undefined
        };

        const payments = await PaymentService.getAllPayments(filters);

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error retrieving payments: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};

export const refundPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Payment ID is required'
            });
            return;
        }

        const result = await PaymentService.refundPayment(parseInt(id));

        res.status(200).json({
            success: result.response.success,
            payment_id: result.payment.id,
            status: result.payment.status,
            message: result.response.message,
            transaction_id: result.response.transaction_id
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: `Error refunding payment: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};

export const getPaymentStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;

        const statistics = await PaymentService.getPaymentStatistics({
            startDate: typeof startDate === 'string' ? startDate : undefined,
            endDate: typeof endDate === 'string' ? endDate : undefined
        });

        res.status(200).json({
            success: true,
            statistics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error retrieving statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};
