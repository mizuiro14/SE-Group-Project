import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { PaymentType } from '../types/payment';

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
        error.message.includes('Unsupported payment type')
    );
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, type, is_default, details } = req.body;

        // Validate required fields
        if (user_id === undefined || type === undefined || details === undefined) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: user_id, type, details'
            });
            return;
        }

        if (!isPositiveNumber(user_id)) {
            res.status(400).json({
                success: false,
                message: 'user_id must be a positive number'
            });
            return;
        }

        // Validate payment type
        if (typeof type !== 'string' || !Object.values(PaymentType).includes(type as PaymentType)) {
            res.status(400).json({
                success: false,
                message: `Invalid payment type. Supported types: ${Object.values(PaymentType).join(', ')}`
            });
            return;
        }

        // Create payment method
        const payment = await PaymentService.createPaymentMethod({
            user_id,
            type: type as PaymentType,
            is_default,
            details
        });

        res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        if (isPaymentValidationError(error)) {
            res.status(400).json({
                success: false,
                message: `Error creating payment method: ${error instanceof Error ? error.message : 'Invalid payment request'}`
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: `Error creating payment method: ${error instanceof Error ? error.message : 'Unknown error'}`
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

export const getPaymentsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const parsedUserId = parsePositiveInteger(userId);
        if (parsedUserId === null) {
            res.status(400).json({
                success: false,
                message: 'User ID must be a positive integer'
            });
            return;
        }

        const payments = await PaymentService.getPaymentsByUserId(parsedUserId);

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
        const { user_id, type, is_default, limit, offset } = req.query;
        const parsedUserId = typeof user_id === 'string' ? Number.parseInt(user_id, 10) : undefined;
        const parsedIsDefault = typeof is_default === 'string' ? is_default === 'true' : undefined;

        const filters = {
            user_id: Number.isFinite(parsedUserId) ? parsedUserId : undefined,
            type: typeof type === 'string' ? type : undefined,
            is_default: parsedIsDefault,
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

export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { type, is_default, details } = req.body;

        const paymentId = parsePositiveInteger(id);
        if (paymentId === null) {
            res.status(400).json({
                success: false,
                message: 'Payment ID must be a positive integer'
            });
            return;
        }

        if (type !== undefined && (typeof type !== 'string' || !Object.values(PaymentType).includes(type as PaymentType))) {
            res.status(400).json({
                success: false,
                message: `Invalid payment type. Supported types: ${Object.values(PaymentType).join(', ')}`
            });
            return;
        }

        const updated = await PaymentService.updatePaymentMethod(paymentId, {
            type: type as PaymentType | undefined,
            is_default,
            details
        });

        res.status(200).json({
            success: true,
            payment: updated
        });
    } catch (error) {
        if (isPaymentValidationError(error)) {
            res.status(400).json({
                success: false,
                message: `Error updating payment method: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: `Error updating payment method: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};

export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
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

        await PaymentService.deletePaymentMethod(paymentId);

        res.status(200).json({
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Error deleting payment method: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
};
