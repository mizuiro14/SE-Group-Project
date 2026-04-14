import { supabase } from '../SupabaseClient';
import { Shipping, CreateShippingRequest, UpdateShippingRequest } from '../types/shipping';

export const getAllShippings = async (filters?: { status?: string; order_id?: number; limit?: number; offset?: number; }): Promise<Shipping[]> => {
    let query: any = supabase.from('shipping').select('*');

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.order_id) query = query.eq('order_id', filters.order_id);
    if (filters?.limit) {
        const offset = filters?.offset || 0;
        query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
};

export const getShippingById = async (id: number): Promise<Shipping> => {
    const { data, error } = await supabase.from('shipping').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Shipping not found');
    return data;
};

export const getShippingByOrderId = async (orderId: number): Promise<Shipping[]> => {
    const { data, error } = await supabase.from('shipping').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
};

export const createShipping = async (payload: CreateShippingRequest): Promise<Shipping> => {
    const { data, error } = await supabase
        .from('shipping')
        .insert([
            {
                order_id: payload.order_id,
                address: payload.address,
            },
        ])
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to create shipping entry');
    return data;
};

export const updateShipping = async (id: number, updates: UpdateShippingRequest): Promise<Shipping> => {
    const { data, error } = await supabase
        .from('shipping')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Shipping not found');
    return data;
};

export const deleteShipping = async (id: number): Promise<void> => {
    const { error } = await supabase.from('shipping').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

export default {
    getAllShippings,
    getShippingById,
    getShippingByOrderId,
    createShipping,
    updateShipping,
    deleteShipping,
};
