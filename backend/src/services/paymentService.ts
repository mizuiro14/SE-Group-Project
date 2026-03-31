import { supabase } from '../SupabaseClient';
import { Payment, PaymentRequest, PaymentResponse, PaymentMethod } from '../types/payment';
import { PaymentStrategyFactory } from '../strategies/paymentStrategyFactory';

export class PaymentService {
    /**
     * Create a new payment record in the database
     */
    static async createPayment(
        orderId: number,
        amount: number,
        method: PaymentMethod
    ): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .insert({
                order_id: orderId,
                amount,
                method,
                status: 'pending',
                payment_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create payment: ${error.message}`);
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
    static async getPaymentsByOrderId(orderId: number): Promise<Payment[]> {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
        return (data as Payment[]) || [];
    }

    /**
     * Retrieve all payments (with optional filters)
     */
    static async getAllPayments(filters?: {
        status?: string;
        method?: string;
        limit?: number;
        offset?: number;
    }): Promise<Payment[]> {
        let query = supabase.from('payments').select('*');

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.method) {
            query = query.eq('method', filters.method);
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
     * Update payment status
     */
    static async updatePaymentStatus(
        paymentId: number,
        status: 'pending' | 'completed' | 'failed' | 'refunded'
    ): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', paymentId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update payment: ${error.message}`);
        if (!data) throw new Error('Payment update failed');

        return data as Payment;
    }

    /**
     * Process payment using strategy pattern
     */
    static async processPayment(paymentRequest: PaymentRequest): Promise<{
        payment: Payment;
        response: PaymentResponse;
    }> {
        try {
            // Get the appropriate payment strategy
            const strategy = PaymentStrategyFactory.createStrategy(paymentRequest.method);

            // Process payment through strategy
            const paymentResponse = await strategy.processPayment(paymentRequest);

            // Create payment record in database
            let payment = await this.createPayment(
                paymentRequest.order_id,
                paymentRequest.amount,
                paymentRequest.method
            );

            // Update payment status based on strategy response
            const statusMap: { [key: string]: 'pending' | 'completed' | 'failed' | 'refunded'; } = {
                'completed': 'completed',
                'pending': 'pending',
                'failed': 'failed',
                'refunded': 'refunded'
            };

            const newStatus = statusMap[paymentResponse.status || 'pending'];
            payment = await this.updatePaymentStatus(payment.id, newStatus);

            return {
                payment,
                response: {
                    ...paymentResponse,
                    payment_id: payment.id
                }
            };
        } catch (error) {
            throw new Error(
                `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Refund a payment
     */
    static async refundPayment(paymentId: number): Promise<{
        payment: Payment;
        response: PaymentResponse;
    }> {
        try {
            // Get existing payment
            const payment = await this.getPaymentById(paymentId);

            if (payment.status === 'refunded') {
                throw new Error('Payment is already refunded');
            }

            if (payment.status !== 'completed') {
                throw new Error('Only completed payments can be refunded');
            }

            // Get strategy for the payment method
            const strategy = PaymentStrategyFactory.createStrategy(payment.method as PaymentMethod);

            // Process refund through strategy
            const refundResponse = await strategy.refundPayment(paymentId, payment.amount);

            // Update payment status
            const statusMap: { [key: string]: 'pending' | 'completed' | 'failed' | 'refunded'; } = {
                'completed': 'completed',
                'pending': 'pending',
                'failed': 'failed',
                'refunded': 'refunded'
            };

            const newStatus = statusMap[refundResponse.status || 'pending'];
            const updatedPayment = await this.updatePaymentStatus(paymentId, newStatus);

            return {
                payment: updatedPayment,
                response: {
                    ...refundResponse,
                    payment_id: paymentId
                }
            };
        } catch (error) {
            throw new Error(
                `Refund processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Get payment statistics
     */
    static async getPaymentStatistics(filters?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{
        totalPayments: number;
        totalAmount: number;
        completedAmount: number;
        pendingAmount: number;
        failedAmount: number;
        byMethod: Record<string, number>;
        byStatus: Record<string, number>;
    }> {
        try {
            let query = supabase.from('payments').select('*');

            if (filters?.startDate) {
                query = query.gte('created_at', filters.startDate);
            }

            if (filters?.endDate) {
                query = query.lte('created_at', filters.endDate);
            }

            const { data, error } = await query;

            if (error) throw new Error(`Failed to fetch statistics: ${error.message}`);

            const payments = (data as Payment[]) || [];

            const statistics = {
                totalPayments: payments.length,
                totalAmount: 0,
                completedAmount: 0,
                pendingAmount: 0,
                failedAmount: 0,
                byMethod: {} as Record<string, number>,
                byStatus: {} as Record<string, number>
            };

            payments.forEach(payment => {
                statistics.totalAmount += payment.amount;

                if (payment.status === 'completed') {
                    statistics.completedAmount += payment.amount;
                } else if (payment.status === 'pending') {
                    statistics.pendingAmount += payment.amount;
                } else if (payment.status === 'failed') {
                    statistics.failedAmount += payment.amount;
                }

                // Count by method
                statistics.byMethod[payment.method] = (statistics.byMethod[payment.method] || 0) + 1;

                // Count by status
                statistics.byStatus[payment.status] = (statistics.byStatus[payment.status] || 0) + 1;
            });

            return statistics;
        } catch (error) {
            throw new Error(
                `Failed to generate statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
