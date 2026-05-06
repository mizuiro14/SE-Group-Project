import { supabase } from '../SupabaseClient';
import { Payment, PaymentCreateRequest, PaymentUpdateRequest, PaymentType } from '../types/payment';
import { PaymentStrategyFactory } from '../strategies/paymentStrategyFactory';

export class PaymentService {
    private static async clearDefaultForUser(userId: number): Promise<void> {
        const { error } = await supabase
            .from('payments')
            .update({ is_default: false, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('is_default', true);

        if (error) throw new Error(`Failed to clear default payment: ${error.message}`);
    }

    /**
     * Create a new payment method record in the database
     */
    static async createPaymentMethod(request: PaymentCreateRequest): Promise<Payment> {
        const strategy = PaymentStrategyFactory.createStrategy(request.type);
        const isValidDetails = await strategy.validateDetails(request.details);
        if (!isValidDetails) {
            throw new Error('Invalid payment details for selected payment type');
        }

        const normalizedDetails = strategy.normalizeDetails(request.details);

        if (request.is_default) {
            await this.clearDefaultForUser(request.user_id);
        }

        const { data, error } = await supabase
            .from('payments')
            .insert({
                user_id: request.user_id,
                type: request.type,
                is_default: Boolean(request.is_default),
                details: normalizedDetails,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create payment method: ${error.message}`);
        if (!data) throw new Error('Payment creation failed - no data returned');

        return data as Payment;
    }

    /**
     * Retrieve payment by ID
     */
    static async getPaymentById(paymentId: number): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (error) throw new Error(`Failed to fetch payment: ${error.message}`);
        if (!data) throw new Error('Payment not found');

        return data as Payment;
    }

    /**
     * Retrieve all payments for an order
     */
    static async getPaymentsByUserId(userId: number): Promise<Payment[]> {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
        return (data as Payment[]) || [];
    }

    /**
     * Retrieve all payments (with optional filters)
     */
    static async getAllPayments(filters?: {
        user_id?: number;
        type?: string;
        is_default?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<Payment[]> {
        let query = supabase.from('payments').select('*');

        if (filters?.user_id !== undefined) {
            query = query.eq('user_id', filters.user_id);
        }

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.is_default !== undefined) {
            query = query.eq('is_default', filters.is_default);
        }

        if (filters?.limit) {
            const offset = filters?.offset || 0;
            query = query.range(offset, offset + filters.limit - 1);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
        return (data as Payment[]) || [];
    }

    /**
     * Update payment method details
     */
    static async updatePaymentMethod(paymentId: number, updates: PaymentUpdateRequest): Promise<Payment> {
        if (!updates.type && updates.is_default === undefined && !updates.details) {
            throw new Error('No updates provided');
        }

        const existing = await this.getPaymentById(paymentId);
        if (existing.user_id === null) {
            throw new Error('Payment method is missing user reference');
        }

        const nextType = (updates.type || existing.type) as PaymentType;
        if (!nextType) {
            throw new Error('Payment type is required for update');
        }

        let normalizedDetails = existing.details;
        if (updates.details) {
            const strategy = PaymentStrategyFactory.createStrategy(nextType);
            const isValidDetails = await strategy.validateDetails(updates.details);
            if (!isValidDetails) {
                throw new Error('Invalid payment details for selected payment type');
            }
            normalizedDetails = strategy.normalizeDetails(updates.details);
        }

        if (updates.is_default) {
            await this.clearDefaultForUser(existing.user_id);
        }

        const { data, error } = await supabase
            .from('payments')
            .update({
                type: updates.type ?? existing.type,
                is_default: updates.is_default ?? existing.is_default,
                details: normalizedDetails,
                updated_at: new Date().toISOString()
            })
            .eq('id', paymentId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update payment method: ${error.message}`);
        if (!data) throw new Error('Payment update failed');

        return data as Payment;
    }

    /**
     * Delete a payment method
     */
    static async deletePaymentMethod(paymentId: number): Promise<void> {
        const { error } = await supabase
            .from('payments')
            .delete()
            .eq('id', paymentId);

        if (error) throw new Error(`Failed to delete payment method: ${error.message}`);
    }
}
