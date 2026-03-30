import { Request, Response } from 'express';
import productService from '../services/productService';

const parseStringParam = (param: string | string[]): string => {
    return Array.isArray(param) ? param[0] : param;
};

const parseStringOrUndefined = (param: any): string | undefined => {
    if (Array.isArray(param)) return param[0];
    if (typeof param === 'string') return param;
    return undefined;
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category_id, search, limit, offset } = req.query;

        const filters = {
            category_id: category_id ? parseInt(parseStringOrUndefined(category_id) || '0') : undefined,
            search: parseStringOrUndefined(search),
            limit: limit ? parseInt(parseStringOrUndefined(limit) || '20') || 20 : 20,
            offset: offset ? parseInt(parseStringOrUndefined(offset) || '0') || 0 : 0,
        };

        const products = await productService.getAllProducts(filters);
        res.status(200).json(products);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(parseInt(parseStringParam(id)));
        res.status(200).json(product);
    } catch (err: any) {
        if (err.message === 'Product not found') {
            res.status(404).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, quantity, category_id, sku } = req.body;

        if (!name || price === undefined || quantity === undefined) {
            res.status(400).json({ error: 'Name, price, and quantity are required' });
            return;
        }

        if (price < 0) {
            res.status(400).json({ error: 'Price must be non-negative' });
            return;
        }

        const product = await productService.createProduct({
            name,
            description: description || null,
            price,
            quantity,
            category_id: category_id || null,
            sku: sku || null,
        });

        res.status(201).json(product);
    } catch (err: any) {
        if (err.message.includes('duplicate key')) {
            res.status(400).json({ error: 'SKU must be unique' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, price, quantity, category_id, sku } = req.body;

        if (price !== undefined && price < 0) {
            res.status(400).json({ error: 'Price must be non-negative' });
            return;
        }

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = price;
        if (quantity !== undefined) updates.quantity = quantity;
        if (category_id !== undefined) updates.category_id = category_id;
        if (sku !== undefined) updates.sku = sku;

        const product = await productService.updateProduct(parseInt(parseStringParam(id)), updates);
        res.status(200).json(product);
    } catch (err: any) {
        if (err.message === 'Product not found') {
            res.status(404).json({ error: err.message });
        } else if (err.message.includes('duplicate key')) {
            res.status(400).json({ error: 'SKU must be unique' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await productService.deleteProduct(parseInt(parseStringParam(id)));
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.params;
        const products = await productService.getProductsByCategoryId(parseInt(parseStringParam(categoryId)));
        res.status(200).json(products);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getBestSellers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit } = req.query;
        const limitValue = limit ? parseInt(parseStringOrUndefined(limit) || '5') || 5 : 5;
        const products = await productService.getBestSellers(limitValue);
        res.status(200).json(products);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query;
        const searchQuery = parseStringOrUndefined(query);

        if (!searchQuery || searchQuery.trim().length === 0) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }

        const products = await productService.searchProducts(searchQuery);
        res.status(200).json(products);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProductQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 0) {
            res.status(400).json({ error: 'Quantity must be a non-negative number' });
            return;
        }

        const product = await productService.updateProductQuantity(parseInt(parseStringParam(id)), quantity);
        res.status(200).json(product);
    } catch (err: any) {
        if (err.message === 'Product not found') {
            res.status(404).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getBestSellers,
    searchProducts,
    updateProductQuantity,
};
