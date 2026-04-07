import { supabase, supabaseAdmin } from '../SupabaseClient';

export type User = {
    id?: number;
    username: string;
    user_email: string;
    cellphone_number?: string;
    role?: string;
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data as User[];
};

export const searchUser = async (query: string): Promise<User[]> => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("username", `%${query}%`);

    if (error) throw new Error(error.message);
    return data || [];
};

export const searchUserByEmail = async (userEmail: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_email", userEmail)
        .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
};

export const createUser = async (userData: User | User[]): Promise<User[]> => {
    const payload = Array.isArray(userData) ? userData : [userData];

    // USE THE UNTOUCHED ADMIN CLIENT HERE
    const { data, error } = await supabaseAdmin
        .from('users')
        .insert(payload)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data as User[];
};

export default {
    getUsers,
    createUser,
    searchUser,
    searchUserByEmail
};