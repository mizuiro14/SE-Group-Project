import { Request, Response } from 'express';
import imageService from '../services/imageService';
import { searchUserByEmail } from '../services/userService';

const parseStringParam = (param: string | string[]): string => {
    return Array.isArray(param) ? param[0] : param;
};

const parseId = (value: string): number => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error('Invalid id parameter');
    }

    return parsed;
};

const isEmail = (value: string): boolean => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
};

const resolveUserId = async (value: string): Promise<number> => {
    try {
        return parseId(value);
    } catch {
        if (!isEmail(value)) {
            throw new Error('Invalid id parameter');
        }

        const user = await searchUserByEmail(value);
        if (!user?.id) {
            throw new Error('User not found');
        }

        return user.id;
    }
};

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Image file is required. Use form-data key "image".' });
            return;
        }

        const productId = parseId(parseStringParam(req.params.productId));
        const image = await imageService.uploadImage(req.file, { productId });
        res.status(201).json(image);
    } catch (err: any) {
        if (err.message === 'Invalid id parameter') {
            res.status(400).json({ error: err.message });
            return;
        }

        res.status(500).json({ error: err.message });
    }
};

export const uploadUserImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Image file is required. Use form-data key "image".' });
            return;
        }

        const userId = await resolveUserId(parseStringParam(req.params.userId));
        const image = await imageService.uploadImage(req.file, { userId });
        res.status(201).json(image);
    } catch (err: any) {
        if (err.message === 'Invalid id parameter') {
            res.status(400).json({ error: err.message });
            return;
        }

        if (err.message === 'User not found') {
            res.status(404).json({ error: err.message });
            return;
        }

        res.status(500).json({ error: err.message });
    }
};

export const getImagesByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseId(parseStringParam(req.params.productId));
        const images = await imageService.getProductImages(productId);
        res.status(200).json(images);
    } catch (err: any) {
        if (err.message === 'Invalid id parameter') {
            res.status(400).json({ error: err.message });
            return;
        }

        res.status(500).json({ error: err.message });
    }
};

export const getImagesByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = await resolveUserId(parseStringParam(req.params.userId));
        const images = await imageService.getUserImages(userId);
        res.status(200).json(images);
    } catch (err: any) {
        if (err.message === 'Invalid id parameter') {
            res.status(400).json({ error: err.message });
            return;
        }

        if (err.message === 'User not found') {
            res.status(404).json({ error: err.message });
            return;
        }

        res.status(500).json({ error: err.message });
    }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const imageId = parseId(parseStringParam(req.params.id));
        await imageService.deleteImageById(imageId);
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (err: any) {
        if (err.message === 'Invalid id parameter') {
            res.status(400).json({ error: err.message });
            return;
        }

        if (err.message === 'Image not found') {
            res.status(404).json({ error: err.message });
            return;
        }

        res.status(500).json({ error: err.message });
    }
};

export default {
    uploadProductImage,
    uploadUserImage,
    getImagesByProduct,
    getImagesByUser,
    deleteImage,
};
