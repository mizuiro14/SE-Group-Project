import { Request, Response } from "express";
import userService from '../services/userService';

// ! TEMPORARY
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const userData = req.body;

    const usersToValidate = Array.isArray(userData) ? userData : [userData];

    const invalidUser = usersToValidate.find(u => !u.username || !u.user_email);

    if (invalidUser) {
        res.status(400).json({ error: 'Username and user_email are required for all users' });
        return;
    }

    try {
        const users = await userService.createUser(userData);
        const responseBody = Array.isArray(userData) ? users : users[0];
        res.status(201).json(responseBody);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const searchUser = async (req: Request, res: Response) => {
    const { search } = req.body;

    if (!search) {
        res.status(400).json({ error: 'A search input is required' });
        return;
    }

    try {
        const users = await userService.searchUser(search);
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};


// ======== ADD THIS NEW FUNCTION ========
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const { first_name, last_name, email, contact } = req.body;
        
        // req.user logic is populated by authenticate middleware
        const userId = (req as any).user?.id;
        
        if (!userId) {
             res.status(401).json({ error: "Unauthorized" });
             return;
        }

        const updatedUser = await userService.updateSupabaseUser(userId, {
             email,
             first_name,
             last_name,
             contact
        });

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteTestUser = async (req: Request, res: Response) => {
    try {
        // Force TypeScript to treat this as a string
        const email = req.params.email as string; 
        
        if (!email) {
            res.status(400).json({ error: "Email parameter is required" });
            return;
        }

        // Now TypeScript knows for sure it is a single string!
        await userService.deleteTestUser(email);
        res.status(200).json({ message: `Test user ${email} deleted successfully` });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// ! TEMPORARY
export default {
    getUsers,
    createUser,
    searchUser,
    updateUserProfile,
    deleteTestUser // <-- Add it to the export
};