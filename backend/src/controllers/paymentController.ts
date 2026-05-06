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
        error.message.includes('Unsupported payment type')
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
    if (!userEmail) {
        throw new Error("User email missing in Supabase Auth");
    }

    // 2. Look up the custom integer ID in your 'users' table
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('user_email', userEmail)
        .single();

    if (!userError && userData) {
        return userData.id;
    }

    // 3. Self-heal: create user if missing in public.users
    const username =
        authData.user.user_metadata?.username ||
        authData.user.user_metadata?.full_name ||
        userEmail.split('@')[0] ||
        'UnknownUser';
    const role = authData.user.user_metadata?.role || 'buyer';

    const { data: createdUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({ user_email: userEmail, username, role })
        .select('id')
        .single();

    if (createError || !createdUser) {
        throw new Error("User not found in custom Postgres users table");
    }

    return createdUser.id;
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

// ===============================================
// WORKAROUND APPLIED METHODS
// ===============================================
export const getUserPaymentMethods = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // FIX: explicitly cast userId to string for TypeScript
        const integerUserId = await getIntegerUserIdFromAuthUuid(userId as string);

        const { data, error } = await supabaseAdmin
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
            await supabaseAdmin
                .from('payments')
                .update({ is_default: false })
                .eq('user_id', integerUserId);
        }

        const { data, error } = await supabaseAdmin
            .from('payments')
            .insert([{ user_id: integerUserId, type, is_default, details }])
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(201).json({ success: true, method: data });
    } catch (error: any) {
        console.error("Payment Method Error:", error);
        res.status(500).json({ success: false, message: 'Error creating payment method', error: error.message });
    }
};

export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { type, is_default, details, user_id } = req.body;

        if (is_default && user_id) {
            // FIX: explicitly cast user_id to string for TypeScript
            const integerUserId = await getIntegerUserIdFromAuthUuid(user_id as string);

            await supabaseAdmin
                .from('payments')
                .update({ is_default: false })
                .eq('user_id', integerUserId);
        }

        const { data, error } = await supabaseAdmin
            .from('payments')
            .update({ type, is_default, details })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(200).json({ success: true, method: data });
    } catch (error: any) {
        console.error("Payment Method Error:", error);
        res.status(500).json({ success: false, message: 'Error updating payment method', error: error.message });
    }
};

export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('payments')
            .delete()
            // optionally you can cast id here too just to be safe
            .eq('id', id as string);

        if (error) throw new Error(error.message);

        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        console.error("Payment Method Error:", error);
        res.status(500).json({ success: false, message: 'Error deleting payment method', error: error.message });
    }
};