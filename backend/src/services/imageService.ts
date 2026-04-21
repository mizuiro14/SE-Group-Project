import { supabaseAdmin } from '../SupabaseClient';

const BUCKET_NAME = 'images';
const PUBLIC_URL_SEGMENT = `/storage/v1/object/public/${BUCKET_NAME}/`;

export interface ImageRecord {
    id: number;
    created_at: string;
    image_url: string;
    user_id: number | null;
    product_id: number | null;
}

const buildStoragePath = (fileName: string, userId?: number, productId?: number): string => {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const stamp = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

    if (productId) {
        return `products/${productId}/${stamp}-${safeFileName}`;
    }

    if (userId) {
        return `users/${userId}/${stamp}-${safeFileName}`;
    }

    return `misc/${stamp}-${safeFileName}`;
};

const getStoragePathFromPublicUrl = (url: string): string | null => {
    const index = url.indexOf(PUBLIC_URL_SEGMENT);

    if (index === -1) {
        return null;
    }

    return url.slice(index + PUBLIC_URL_SEGMENT.length);
};

export const uploadImage = async (
    file: Express.Multer.File,
    options: { userId?: number; productId?: number; }
): Promise<ImageRecord> => {
    const storagePath = buildStoragePath(file.originalname, options.userId, options.productId);

    const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    const imageUrl = publicUrlData.publicUrl;

    const { data, error } = await supabaseAdmin
        .from('images')
        .insert([
            {
                image_url: imageUrl,
                user_id: options.userId ?? null,
                product_id: options.productId ?? null,
            },
        ])
        .select()
        .single();

    if (error) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([storagePath]);
        throw new Error(`Failed to persist image record: ${error.message}`);
    }

    if (!data) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([storagePath]);
        throw new Error('Failed to create image record');
    }

    return data;
};

export const getProductImages = async (productId: number): Promise<ImageRecord[]> => {
    const { data, error } = await supabaseAdmin
        .from('images')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
};

export const getUserImages = async (userId: number): Promise<ImageRecord[]> => {
    const { data, error } = await supabaseAdmin
        .from('images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
};

export const deleteImageById = async (imageId: number): Promise<void> => {
    const { data: image, error: findError } = await supabaseAdmin
        .from('images')
        .select('*')
        .eq('id', imageId)
        .single();

    if (findError) {
        throw new Error(findError.message);
    }

    if (!image) {
        throw new Error('Image not found');
    }

    const storagePath = getStoragePathFromPublicUrl(image.image_url);
    if (storagePath) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([storagePath]);
    }

    const { error: deleteError } = await supabaseAdmin
        .from('images')
        .delete()
        .eq('id', imageId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }
};

export default {
    uploadImage,
    getProductImages,
    getUserImages,
    deleteImageById,
};
