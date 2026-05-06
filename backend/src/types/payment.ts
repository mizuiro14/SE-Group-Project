export interface Payment {
    id: number;
    created_at: string;
    updated_at: string;
    user_id: number | null;
    type: PaymentType | string | null;
    is_default: boolean | null;
    details: Record<string, any> | null;
}

export interface PaymentCreateRequest {
    user_id: number;
    type: PaymentType;
    is_default?: boolean;
    details: Record<string, any>;
}

export interface PaymentUpdateRequest {
    type?: PaymentType;
    is_default?: boolean;
    details?: Record<string, any>;
}

export enum PaymentType {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    PAYPAL = 'paypal',
    BANK_TRANSFER = 'bank_transfer',
    WALLET = 'wallet'
}

export interface IPaymentStrategy {
    validateDetails(details: Record<string, any>): Promise<boolean>;
    normalizeDetails(details: Record<string, any>): Record<string, any>;
}
