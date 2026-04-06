import { Request, Response } from 'express';
import authService from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const signup = async (req: Request, res: Response): Promise<void> => {
    // 1. Add contact, role, and branch to the destructuring
    const { email, password, username, contact, role, branch } = req.body;

    if (!email || !password || !username) {
        res.status(400).json({ error: 'Email, password, and username are required' });
        return;
    }

    try {
        // 2. Pass those values to the authService
        const data = await authService.signup(email, password, username, contact, role, branch);
        
        res.status(201).json({
            message: 'Signup successful. Check your email for a confirmation link.',
            user: data.user,
            session: data.session,
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    try {
        const data = await authService.login(email, password);
        res.status(200).json({
            user: data.user,
            session: data.session,
        });
    } catch (err: any) {
        res.status(401).json({ error: err.message });
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const token = req.headers.authorization!.split(' ')[1];

    try {
        await authService.logout(token);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.status(200).json({ user: req.user });
};

export default { signup, login, logout, me };
