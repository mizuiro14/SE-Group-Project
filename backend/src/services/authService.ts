import { supabase } from '../SupabaseClient';
import { createUser, User as UserServiceUser } from './userService'; // Alias User from userService
import { SellerService } from './sellerService';
import { BuyerService } from './buyerService';
// import { User } from '../types/user'; // Removed to avoid type conflict with userService.User

const sellerService = new SellerService();
const buyerService = new BuyerService();

export const signup = async (
    email: string, 
    password: string, 
    username: string, 
    contact?: string, 
    role?: string, 
    branch?: string
) => {
    // 1. Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { 
                // Map the frontend 'username' to 'full_name' for the Supabase Auth UI
                full_name: username,
                // Keep the original username just in case 
                username: username, 
                contact: contact,
                role: role,
                branch: branch
            },
        },
    });

    if (error) throw new Error(error.message);

    // --- NEW: Force the string into the official Phone column ---
    // Note: 'contact' must be in strict E.164 format (e.g. +14155552671)
    if (contact && data.user) {
        try {
            await supabase.auth.admin.updateUserById(data.user.id, { 
                phone: contact,
                // Set phone_confirm implicitly because we're signing them up via email
                user_metadata: { phone_confirmed: true }
            });
        } catch (phoneErr: any) {
            console.error('Could not set official phone column (likely invalid format):', phoneErr.message);
        }
    }

    // 2. Also create user in your custom public.users database table
    let createdUserInPublicTable: UserServiceUser | null = null; // Use aliased User type
    try {
        // Ensure the ID from Supabase Auth is used for the public.users table
        if (data.user) {
            const usersInPublicTable = await createUser({ 
                id: parseInt(data.user.id, 10), // Assuming public.users.id is numeric and matches auth.uid
                user_email: email, // Use user_email as expected by userService.User
                username: username, 
                cellphone_number: contact, 
                role: role 
            });
            if (usersInPublicTable && usersInPublicTable.length > 0) {
                createdUserInPublicTable = usersInPublicTable[0];
            }
        }
    } catch (err: any) {
        console.error('Error creating user in custom users table:', err.message);
        // Don't throw - auth was successful, users table creation is secondary
    }

    // 3. Conditionally create seller or buyer profile
    if (createdUserInPublicTable && createdUserInPublicTable.id && role) {
        if (role === 'seller') {
            await sellerService.createSeller({ 
                user_id: createdUserInPublicTable.id, 
                branch: branch || 'Default Branch',
                rating: null // Provide default null for rating
            });
        } else if (role === 'buyer') {
            await buyerService.createBuyer({ 
                user_id: createdUserInPublicTable.id,
                region: null, // Provide default null for optional fields
                province: null,
                city: null,
                barangay: null,
                street_address: null
            });
        }
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