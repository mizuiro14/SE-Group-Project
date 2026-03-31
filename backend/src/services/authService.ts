import { supabase } from '../SupabaseClient';
import { createUser } from './userService';

export const signup = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username },
        },
    });

    if (error) throw new Error(error.message);

    // Also create user in users table
    try {
        await createUser({ email, username });
    } catch (err: any) {
        console.error('Error creating user in users table:', err.message);
        // Don't throw - auth was successful, users table creation is secondary
    }

    return data;
};

export const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw new Error(error.message);
    return data;
};

export const logout = async (token: string) => {
    const { error } = await supabase.auth.admin.signOut(token);

    if (error) throw new Error(error.message);
};

export const getUser = async (token: string) => {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw new Error(error.message);
    return data.user;
};

export default { signup, login, logout, getUser };
