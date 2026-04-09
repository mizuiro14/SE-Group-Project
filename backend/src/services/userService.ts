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

// ======== THE MISSING FUNCTION ========
export const updateSupabaseUser = async (userId: string, data: any) => {
    // 1. Update Auth user metadata
    const { data: updatedAuthUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
            email: data.email,
            user_metadata: {
                first_name: data.first_name,
                last_name: data.last_name,
                // keep a combined username in sync
                username: `${data.first_name} ${data.last_name}`.trim(),
                contact: data.contact,
            }
        }
    );

    if (authError) {
        throw new Error(authError.message);
    }

    // 2. Also try to keep custom public.users table in sync
    try {
        await supabaseAdmin.from('users')
            .update({ 
                username: `${data.first_name} ${data.last_name}`.trim(),
                user_email: data.email,
                cellphone_number: data.contact 
            })
            // Match the email from the backend payload
            .eq('user_email', data.email);
    } catch(err) {
        console.log('Note: Failed to sync public.users table, but auth was updated');
    }

    return updatedAuthUser.user;
};

export default {
    getUsers,
    createUser,
    searchUser,
    searchUserByEmail,
    updateSupabaseUser
};