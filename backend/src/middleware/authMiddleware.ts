import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

export interface AuthenticatedRequest extends Request {
    user?: { id: string; email?: string; };
}

export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const user = await authService.getUser(token);
        req.user = { id: user.id, email: user.email ?? undefined };
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
