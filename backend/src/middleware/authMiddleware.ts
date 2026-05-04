import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

export interface AuthenticatedRequest extends Request {
    user?: any; // Changed to accept the full Supabase user object including user_metadata
}

export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // 1. Read the token from the HTTP-only cookie instead of req.headers
    const token = req.cookies?.access_token;

    if (!token) {
        res.status(401).json({ error: 'Missing or invalid authorization cookie' });
        return;
    }

    try {
        // 2. Fetch user from Supabase using the token
        const user = await authService.getUser(token);
        
        // 3. Attach the entire user object so we keep user_metadata (role, branch, etc.)
        req.user = user; 
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};