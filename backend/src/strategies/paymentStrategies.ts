import { IPaymentStrategy, PaymentRequest, PaymentResponse } from '../types/payment';

/**
 * Credit Card Payment Strategy
 */
export class CreditCardPaymentStrategy implements IPaymentStrategy {
    async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
        try {
            // Simulate external payment gateway (Stripe, Square, etc.)
            // In production, integrate with actual payment processor
            const transactionId = `CC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Validate amount
            if (paymentRequest.amount <= 0) {
                return {
                    success: false,
                    status: 'failed',
                    message: 'Invalid amount'
                };
            }

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 500));

            return {
                success: true,
                status: 'completed',
                message: 'Credit card payment processed successfully',
                transaction_id: transactionId
            };
        } catch (error) {
            return {
                success: false,
                status: 'failed',
                message: `Credit card payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async refundPayment(paymentId: number, amount: number): Promise<PaymentResponse> {
        try {
            const transactionId = `REFUND_CC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await new Promise(resolve => setTimeout(resolve, 300));

            return {
                success: true,
                status: 'refunded',
                message: 'Credit card refund processed successfully',
                transaction_id: transactionId
            };
        } catch (error) {
            return {
                success: false,
                status: 'failed',
                message: `Credit card refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async validatePaymentDetails(details: Record<string, any>): Promise<boolean> {
        // Validate card number (Luhn algorithm), expiry, CVC
        const { cardNumber, expiryDate, cvc } = details;

        if (!cardNumber || !expiryDate || !cvc) {
            return false;
        }

        // Basic Luhn check
        const sanitized = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(sanitized)) {
            return false;
        }

        // Validate expiry format (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            return false;
        }

        // Validate CVC
        if (!/^\d{3,4}$/.test(cvc)) {
            return false;
        }

        return true;
    }
}

/**
 * PayPal Payment Strategy
 */
export class PayPalPaymentStrategy implements IPaymentStrategy {
    async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
        try {
            // Simulate PayPal API call
            const transactionId = `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            if (paymentRequest.amount <= 0) {
                return {
                    success: false,
                    status: 'failed',
                    message: 'Invalid amount'
                };
            }

            await new Promise(resolve => setTimeout(resolve, 800));

            return {
                success: true,
                status: 'completed',
                message: 'PayPal payment processed successfully',
                transaction_id: transactionId
            };
        } catch (error) {
            return {
                success: false,
                status: 'failed',
                message: `PayPal payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async refundPayment(paymentId: number, amount: number): Promise<PaymentResponse> {
        try {
            const transactionId = `REFUND_PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await new Promise(resolve => setTimeout(resolve, 600));

            return {
                success: true,
                status: 'refunded',
                message: 'PayPal refund processed successfully',
                transaction_id: transactionId
            };
        } catch (error) {
            return {
                success: false,
                status: 'failed',
                message: `PayPal refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async validatePaymentDetails(details: Record<string, any>): Promise<boolean> {
        // Validate PayPal email
        const { email } = details;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return false;
        }

        return true;
    }
}

/**
 * Bank Transfer Payment Strategy
 */
export class BankTransferPaymentStrategy implements IPaymentStrategy {
    async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
        try {
            // Bank transfers are typically asynchronous
            const transactionId = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            if (paymentRequest.amount <= 0) {
                return {
                    success: false,
                    status: 'failed',
                    message: 'Invalid amount'
                };
            }

            // Bank transfers need manual verification (pending status)
            return {
                success: true,
                status: 'pending',
                message: 'Bank transfer initiated. Payment will be verified within 2-3 business days',
                transaction_id: transactionId
            };
        } catch (error) {
            return {
                success: false,
                status: 'failed',
                message: `Bank transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async refundPayment(paymentId: number, amount: number): Promise<PaymentResponse> {
        try {
            const transactionId = `REFUND_BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            return {
                success: true,
                status: 'pending',
                message: 'Bank transfer refund initiated. Refund will be processed within 2-3 business days',
                transaction_id: transactionId
            };
        } catch (error) {
            return {
                success: false,
                status: 'failed',
                message: `Bank transfer refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async validatePaymentDetails(details: Record<string, any>): Promise<boolean> {
        // Validate bank account details
        const { accountNumber, routingNumber, bankCode } = details;

        if (!accountNumber || !routingNumber || !bankCode) {
            return false;
        }

        // Basic validation
        if (!/^\d{8,17}$/.test(accountNumber)) {
            return false;
        }

        if (!/^\d{9}$/.test(routingNumber)) {
            return false;
        }

        return true;
    }
}

/**
 * Wallet Payment Strategy
 */
export class WalletPaymentStrategy implements IPaymentStrategy {
    async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
        try {
            const transactionId = `WALLET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            if (paymentRequest.amount <= 0) {
                return {
                    success: false,
                    status: 'failed',
                    message: 'Invalid amount'
                };
            }

            // Simulate wallet deduction
            await new Promise(resolve => setTimeout(resolve, 200));

            return {
                success: true,
                status: 'completed',
                message: 'Wallet payment processed successfully',
                transaction_id: transactionId
            };
        } catch (error) {
            return {
                success: false,
                status: 'failed',
                message: `Wallet payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async refundPayment(paymentId: number, amount: number): Promise<PaymentResponse> {
        try {
            const transactionId = `REFUND_WALLET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await new Promise(resolve => setTimeout(resolve, 150));

            return {
                success: true,
                status: 'refunded',
                message: 'Wallet refund processed successfully',
                transaction_id: transactionId
            };
        } catch (error) {
            return {
                success: false,
                status: 'failed',
                message: `Wallet refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    async validatePaymentDetails(details: Record<string, any>): Promise<boolean> {
        // Validate wallet ID and sufficient balance
        const { walletId, balance } = details;

        if (!walletId || balance === undefined) {
            return false;
        }

        if (balance < 0) {
            return false;
        }

        return true;
    }
}
