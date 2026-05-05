import { supabase } from '../SupabaseClient';
import { Shipping, CreateShippingRequest, UpdateShippingRequest } from '../types/shipping';

export const getAllShippings = async (filters?: { status?: string; order_id?: number; limit?: number; offset?: number; seller_id?: string; }): Promise<Shipping[]> => {
    let query: any = supabase.from('shipping').select('*');

    if (filters?.seller_id) {
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id')
            .eq('seller_id', filters.seller_id);

        if (productsError) throw new Error(productsError.message);

        const productIds = (products || []).map((product: any) => product.id).filter(Boolean);
        if (productIds.length === 0) return [];

        const { data: orderItems, error: orderItemsError } = await supabase
            .from('order_items')
            .select('order_id')
            .in('product_id', productIds);

        if (orderItemsError) throw new Error(orderItemsError.message);

        const orderIds = Array.from(
            new Set((orderItems || []).map((item: any) => item.order_id).filter(Boolean))
        );

        if (orderIds.length === 0) return [];
        query = query.in('order_id', orderIds);
    }

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.order_id) query = query.eq('order_id', filters.order_id);
    if (filters?.limit) {
        const offset = filters?.offset || 0;
        query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    // Explicitly add 'any' type to 'item' to fix TypeScript error
    return (data || []).map((item: any) => ({
        ...item,
        status: item.status?.replace(/['"]/g, '') // Strips out accidental quotes
    }));
};

export const getShippingById = async (id: number): Promise<Shipping> => {
    const { data, error } = await supabase.from('shipping').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Shipping not found');

    data.status = data.status?.replace(/['"]/g, '');
    return data;
};

export const getShippingByOrderId = async (orderId: number): Promise<Shipping[]> => {
    const { data, error } = await supabase.from('shipping').select('*').eq('order_id', orderId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    // Explicitly add 'any' type to 'item' here too
    return (data || []).map((item: any) => ({
        ...item,
        status: item.status?.replace(/['"]/g, '')
    }));
};

export const createShipping = async (payload: CreateShippingRequest): Promise<Shipping> => {
    const { data, error } = await supabase
        .from('shipping')
        .insert([
            {
                order_id: payload.order_id,
                address: payload.address,
                status: 'pending' // Explicitly sets raw string instead of taking undefined or quoted payloads
            },
        ])
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to create shipping entry');
    return data;
};

export const updateShipping = async (id: number, updates: UpdateShippingRequest): Promise<Shipping> => {
    // If the frontend accidentally sends quotes, clean it up before updating
    const cleanedStatus = updates.status?.replace(/['"]/g, '');

    const payloadToUpdate = {
        ...updates,
        ...(cleanedStatus ? { status: cleanedStatus } : {}),
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('shipping')
        .update(payloadToUpdate)
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