import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { PaymentMethod } from '../types/payment';

const parsePositiveInteger = (value: unknown): number | null => {
    if (typeof value !== 'string') {
        return null;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
};

const isPositiveNumber = (value: unknown): value is number => {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
};

const isPaymentValidationError = (error: unknown): boolean => {
    return error instanceof Error && (
        error.message.includes('Invalid payment details') ||
        error.message.includes('Unsupported payment method')
    );
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { order_id, amount, method, metadata } = req.body;

        // Validate required fields
        if (order_id === undefined || amount === undefined || method === undefined) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: order_id, amount, method'
            });
            return;
        }

        if (!isPositiveNumber(order_id) || !isPositiveNumber(amount)) {
            res.status(400).json({
                success: false,
                message: 'order_id and amount must be positive numbers'
            });
            return;
        }

        // Validate payment method
        if (typeof method !== 'string' || !Object.values(PaymentMethod).includes(method as PaymentMethod)) {
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
            method: method as PaymentMethod,
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
        if (isPaymentValidationError(error)) {
            res.status(400).json({
                success: false,
                message: `Error creating payment: ${error instanceof Error ? error.message : 'Invalid payment request'}`
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: `Error creating payment: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const paymentId = parsePositiveInteger(id);
        if (paymentId === null) {
            res.status(400).json({
                success: false,
                message: 'Payment ID must be a positive integer'
            });
            return;
        }

        const payment = await PaymentService.getPaymentById(paymentId);

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

        const parsedOrderId = parsePositiveInteger(orderId);
        if (parsedOrderId === null) {
            res.status(400).json({
                success: false,
                message: 'Order ID must be a positive integer'
            });
            return;
        }

        const payments = await PaymentService.getPaymentsByOrderId(parsedOrderId);

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

        const paymentId = parsePositiveInteger(id);
        if (paymentId === null) {
            res.status(400).json({
                success: false,
                message: 'Payment ID must be a positive integer'
            });
            return;
        }

        const result = await PaymentService.refundPayment(paymentId);

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
