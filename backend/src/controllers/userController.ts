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

// ! TEMPORARY
export default {
    getUsers,
    createUser,
    searchUser,
};