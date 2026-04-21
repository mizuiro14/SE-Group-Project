import { supabase, supabaseAdmin } from '../SupabaseClient';

export type User = {
    id?: number;
    username: string;
    user_email: string;
    cellphone_number?: string;
    role?: string;
    branch?: string;
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
    const dataList = Array.isArray(userData) ? userData : [userData];

    // Strip out the branch before inserting into the `users` table
    const usersPayload = dataList.map(({ branch, ...rest }) => rest);

    // USE THE UNTOUCHED ADMIN CLIENT HERE
    const { data: insertedUsers, error } = await supabaseAdmin
        .from('users')
        .insert(usersPayload)
        .select();

    if (error) {
        throw new Error(error.message);
    }
    
    // Safety check in case selection returns null
    if (!insertedUsers) return [];
    
    // Insert into the `seller` or `buyer` table based on the role
    for (let i = 0; i < dataList.length; i++) {
        const userId = insertedUsers[i].id;
        const role = dataList[i].role;
        
        if (role === 'seller' && dataList[i].branch) {
            const { error: sellerError } = await supabaseAdmin
                .from('seller')
                .insert({
                    user_id: userId,
                    branch: dataList[i].branch
                });
                
            if (sellerError) {
                console.error("Failed to insert seller data:", sellerError.message);
            }
        } else if (role === 'buyer') {
            const { error: buyerError } = await supabaseAdmin
                .from('buyer')
                .insert({
                    user_id: userId
                });
                
            if (buyerError) {
                console.error("Failed to insert buyer data:", buyerError.message);
            }
        }
    }

    return insertedUsers as User[];
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