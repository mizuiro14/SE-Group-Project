export interface Payment {
    id: number;
    order_id: number;
    amount: number;
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    payment_date: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentRequest {
    order_id: number;
    amount: number;
    method: PaymentMethod;
    metadata?: Record<string, any>;
}

export interface PaymentResponse {
    success: boolean;
    payment_id?: number;
    status?: string;
    message: string;
    transaction_id?: string;
}

export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    PAYPAL = 'paypal',
    BANK_TRANSFER = 'bank_transfer',
    WALLET = 'wallet'
}

export interface IPaymentStrategy {
    processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse>;
    refundPayment(paymentId: number, amount: number): Promise<PaymentResponse>;
    validatePaymentDetails(details: Record<string, any>): Promise<boolean>;
}
