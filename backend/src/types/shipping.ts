export type ShippingStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface Shipping {
    id: number;
    order_id: number;
    address: string;
    status: ShippingStatus;
    shipped_date: string | null;
    delivered_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateShippingRequest {
    order_id: number;
    address: string;
}

export interface UpdateShippingRequest {
    address?: string;
    status?: ShippingStatus;
    shipped_date?: string | null;
    delivered_date?: string | null;
}
