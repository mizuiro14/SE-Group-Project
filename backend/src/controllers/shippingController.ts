import { Request, Response } from 'express';
import shippingService from '../services/shippingService';
import { CreateShippingRequest, UpdateShippingRequest } from '../types/shipping';

const parseStringParam = (param: string | string[]): string => (Array.isArray(param) ? param[0] : param);

export const getAllShippings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, order_id, limit, offset } = req.query;
        const filters: any = {};
        if (status) filters.status = parseStringParam(status as any);
        if (order_id) filters.order_id = parseInt(parseStringParam(order_id as any));
        if (limit) filters.limit = parseInt(parseStringParam(limit as any));
        if (offset) filters.offset = parseInt(parseStringParam(offset as any));

        const shippings = await shippingService.getAllShippings(filters);
        res.status(200).json(shippings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getShippingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const shipping = await shippingService.getShippingById(parseInt(parseStringParam(id)));
        res.status(200).json(shipping);
    } catch (err: any) {
        if (err.message === 'Shipping not found') res.status(404).json({ error: err.message });
        else res.status(500).json({ error: err.message });
    }
};

export const getShippingByOrderId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;
        const shippings = await shippingService.getShippingByOrderId(parseInt(parseStringParam(orderId)));
        res.status(200).json(shippings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createShipping = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateShippingRequest;
        if (!body.order_id || !body.address) {
            res.status(400).json({ error: 'order_id and address are required' });
            return;
        }

        const shipping = await shippingService.createShipping(body);
        res.status(201).json(shipping);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateShipping = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body as UpdateShippingRequest;
        const shipping = await shippingService.updateShipping(parseInt(parseStringParam(id)), updates);
        res.status(200).json(shipping);
    } catch (err: any) {
        if (err.message === 'Shipping not found') res.status(404).json({ error: err.message });
        else res.status(500).json({ error: err.message });
    }
};

export const deleteShipping = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await shippingService.deleteShipping(parseInt(parseStringParam(id)));
        res.status(200).json({ message: 'Shipping deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    getAllShippings,
    getShippingById,
    getShippingByOrderId,
    createShipping,
    updateShipping,
    deleteShipping,
};
