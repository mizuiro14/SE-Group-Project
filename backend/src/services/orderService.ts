import { supabase } from '../SupabaseClient';

export interface OrderItem {
    id?: number;
    order_id?: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price?: number;
    created_at?: string;
}

export interface Order {
    id?: number;
    created_at?: string;
    user_id: number;
    status?: string;
    total?: number;
    order_date?: string;
    updated_at?: string;
    items?: OrderItem[];
}

export const getAllOrders = async (filters?: { status?: string; seller_id?: string; }): Promise<Order[]> => {
    let query: any = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

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
        query = query.in('id', orderIds);
    }

    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return (data as any) || [];
};

export const getOrderById = async (id: number): Promise<Order> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Order not found');
    return data as any;
};

export const getOrdersByUserId = async (userId: number): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as any) || [];
};

export const createOrder = async (order: Order): Promise<Order> => {
    // Calculate total from items if provided
    const items = order.items || [];
    const computedTotal = items.reduce((sum, it) => sum + (it.unit_price * it.quantity), 0);

    // Insert order first
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: order.user_id, status: order.status || 'pending', total: computedTotal }])
        .select()
        .single();

    if (orderError) throw new Error(orderError.message);
    if (!orderData) throw new Error('Failed to create order');

    const newOrderId = (orderData as any).id;

    if (items.length > 0) {
        // Map the Next.js `unit_price` payload property to the actual `price` database column
        const itemsToInsert = items.map(it => ({
            order_id: newOrderId,
            product_id: it.product_id,
            quantity: it.quantity,
            price: it.unit_price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) throw new Error(itemsError.message);
    }

    return getOrderById(newOrderId);
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
    const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as any;
};

export const deleteOrder = async (id: number): Promise<void> => {
    // Delete order items then order (FK CASCADE may handle this depending on DB)
    const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
    if (itemsError) throw new Error(itemsError.message);

    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
};

export default {
    getAllOrders,
    getOrderById,
    getOrdersByUserId,
    createOrder,
    updateOrderStatus,
    deleteOrder,
};