import { Request, Response } from 'express';
import orderService from '../services/orderService';

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
        const orders = await orderService.getAllOrders();
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

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, items, status } = req.body;

        if (!user_id || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'user_id and items are required' });
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

        const order = await orderService.createOrder({ user_id, items, status });
        res.status(201).json(order);
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

export default {
    getAllOrders,
    getOrderById,
    getOrdersByUser,
    createOrder,
    updateOrderStatus,
    deleteOrder,
};
