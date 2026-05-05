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
        
        // --- NEW COOKIE LOGIC ---
        // Securely attach the token as an HTTP-only cookie
        if (data.session) {
            res.cookie('access_token', data.session.access_token, {
                httpOnly: true, 
                secure: true,      // Required for Vercel/Render
                sameSite: 'none',  // Required for Vercel/Render
                maxAge: 3600 * 1000 
            });
        }

        res.status(200).json({
            user: data.user
        });
    } catch (err: any) {
        res.status(401).json({ error: err.message });
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const token = req.cookies?.access_token;

    // 1. Define cookieOptions BEFORE doing any response handling
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const
    };

    try {
        if (token) {
            await authService.logout(token);
        }
        
        // 2. Use cookieOptions in the clearCookie call
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err: any) {
        // 3. Use cookieOptions here as well
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(500).json({ error: err.message });
    }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.status(200).json({ user: req.user });
};

export default { signup, login, logout, me };