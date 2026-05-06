import { Request, Response } from 'express';
import orderService from '../services/orderService';
import { supabase, supabaseAdmin } from '../SupabaseClient';

const parseStringParam = (param: string | string[]): string => {
    return Array.isArray(param) ? param[0] : param;
};

const parseStringOrUndefined = (param: any): string | undefined => {
    if (Array.isArray(param)) return param[0];
    if (typeof param === 'string') return param;
    return undefined;
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, seller_id } = req.query;
        const filters: any = {};
        if (status) filters.status = parseStringParam(status as any);
        if (seller_id) filters.seller_id = parseStringParam(seller_id as any);

        const orders = await orderService.getAllOrders(filters);
        res.status(200).json(orders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(parseInt(parseStringParam(id)));
        res.status(200).json(order);
    } catch (err: any) {
        if (err.message === 'Order not found') {
            res.status(404).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

export const getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const orders = await orderService.getOrdersByUserId(parseInt(parseStringParam(userId)));
        res.status(200).json(orders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ error: 'Status is required' });
            return;
        }

        const order = await orderService.updateOrderStatus(parseInt(parseStringParam(id)), status);
        res.status(200).json(order);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await orderService.deleteOrder(parseInt(parseStringParam(id)));
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, email, items, status } = req.body;
        let finalUserId = user_id;

        // If the frontend sent an email, look up the numeric ID from the custom users table
        if (email && !finalUserId) {
            let { data, error } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('user_email', email)
                .single();

            // Self-Heal: If the user isn't in public.users (common dev issue), create them immediately
            if (error || !data) {
                const { data: newUser, error: insertError } = await supabaseAdmin
                    .from('users')
                    .insert({
                        user_email: email,
                        username: email.split('@')[0] || 'UnknownBuyer',
                        role: 'buyer'
                    })
                    .select('id')
                    .single();

                if (insertError || !newUser) {
                    console.error("Self-Heal Database Error:", insertError);
                    res.status(500).json({ error: 'Could not self-heal missing database user' });
                    return;
                }
                data = newUser;
            }

            finalUserId = data.id;
        }

        if (!finalUserId || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'A valid user identifier and items are required' });
            return;
        }

        // Basic validation of items
        for (const it of items) {
            if (!it.product_id || it.quantity === undefined || it.unit_price === undefined) {
                res.status(400).json({ error: 'Each item must have product_id, quantity and unit_price' });
                return;
            }
            if (it.quantity <= 0 || it.unit_price < 0) {
                res.status(400).json({ error: 'Invalid quantity or unit_price' });
                return;
            }
        }

        // Pass the looked-up integer numeric key to the service
        const order = await orderService.createOrder({ user_id: finalUserId, items, status });
        res.status(201).json(order);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    getAllOrders,
    getOrderById,
    getOrdersByUser,
    createOrder,
    updateOrderStatus,
    deleteOrder,
};