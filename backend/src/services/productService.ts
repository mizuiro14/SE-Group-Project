import { supabase, supabaseAdmin } from '../SupabaseClient';

export interface Product {
    id: number;
    seller_id: string;
    name: string;
    description: string | null;
    price: number;
    quantity: number;
    category_id: number | null;
    category: string | null;
    sku: string | null;
    created_at: string;
    updated_at: string;
}

export const getAllProducts = async (filters?: {
    category_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
    seller_id?: string;
}): Promise<Product[]> => {
    let query = supabase.from('products').select('*, categories(name)');

    if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
    }

    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    if (filters?.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
    }

    if (filters?.limit) {
        const offset = filters?.offset || 0;
        query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((item: any) => ({
        ...item,
        category: item.categories?.name || null
    }));
};

export const getProductById = async (id: number): Promise<Product> => {
    const { data, error } = await supabase            
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Product not found');
    return data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Product> => {
    const { data, error } = await supabase
        .from('products')
        .insert([{
            seller_id: product.seller_id,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            category_id: product.category_id,
            sku: product.sku,
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Failed to create product');
    return data;
};

export const updateProduct = async (id: number, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> => {
    const { data, error } = await supabase
        .from('products')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Product not found');
    return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
};

export const getProductsByCategoryId = async (categoryId: number): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
};

export const getBestSellers = async (limit: number = 5): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('quantity', 0)
        .order('quantity', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
};

export const searchProducts = async (query: string): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
};

export const updateProductQuantity = async (id: number, quantity: number): Promise<Product> => {
    // CHANGE THIS from supabase.from(...) to supabaseAdmin.from(...)
    const { data, error } = await supabaseAdmin
        .from('products')
        .update({
            quantity,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Product not found');
    return data;
};
export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategoryId,
    getBestSellers,
    searchProducts,
    updateProductQuantity,
};
