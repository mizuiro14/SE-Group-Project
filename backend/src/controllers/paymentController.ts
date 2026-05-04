import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { PaymentMethod } from '../types/payment';
import { supabase, supabaseAdmin } from '../SupabaseClient';

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

// ===============================================
// WORKAROUND: Map Supabase UUID -> Postgres int8 ID
// ===============================================
const getIntegerUserIdFromAuthUuid = async (uuid: string): Promise<number> => {
    // 1. Get the user's email from Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(uuid);
    if (authError || !authData.user) {
        throw new Error("User not found in Supabase Auth via UUID");
    }

    const userEmail = authData.user.email;

    // 2. Look up the custom integer ID in your 'users' table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_email', userEmail)
        .single();

    if (userError || !userData) {
        throw new Error("User not found in custom Postgres users table");
    }

    return userData.id; // Returns the valid int8!
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

// ===============================================
// WORKAROUND APPLIED METHODS
// ===============================================
export const getUserPaymentMethods = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params; 
        
        // FIX: explicitly cast userId to string for TypeScript
        const integerUserId = await getIntegerUserIdFromAuthUuid(userId as string);
        
        const { data, error } = await supabase
            .from('payments') // Matches your database table name
            .select('*')
            .eq('user_id', integerUserId);

        if (error) throw new Error(error.message);

        res.status(200).json({ success: true, methods: data || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving payment methods' });
    }
};

export const createPaymentMethod = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, type, is_default, details } = req.body; 
        
        // FIX: explicitly cast user_id to string for TypeScript
        const integerUserId = await getIntegerUserIdFromAuthUuid(user_id as string);

        if (is_default) {
           await supabase
               .from('payments')
               .update({ is_default: false })
               .eq('user_id', integerUserId);
        }

        const { data, error } = await supabase
            .from('payments')
            .insert([{ user_id: integerUserId, type, is_default, details }])
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(201).json({ success: true, method: data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating payment method' });
    }
};

export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { type, is_default, details, user_id } = req.body; 

        if (is_default && user_id) {
           // FIX: explicitly cast user_id to string for TypeScript
           const integerUserId = await getIntegerUserIdFromAuthUuid(user_id as string);
           
           await supabase
               .from('payments')
               .update({ is_default: false })
               .eq('user_id', integerUserId);
        }

        const { data, error } = await supabase
            .from('payments')
            .update({ type, is_default, details })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(200).json({ success: true, method: data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating payment method' });
    }
};

export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const { error } = await supabase
            .from('payments')
            .delete()
            // optionally you can cast id here too just to be safe
            .eq('id', id as string);

        if (error) throw new Error(error.message);

        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting payment method' });
    }
};