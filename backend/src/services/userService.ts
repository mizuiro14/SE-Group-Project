import { supabase } from '../SupabaseClient';

export type User = {
    id?: number;
    username: string;
    email: string;
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
    return data || []
};

export const createUser = async (userData: User | User[]): Promise<User[]> => {
    const payload = Array.isArray(userData) ? userData : [userData];

    const { data, error } = await supabase
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
    searchUser
};
