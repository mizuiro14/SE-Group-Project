import { IPaymentStrategy, PaymentMethod } from '../types/payment';
import {
    CreditCardPaymentStrategy,
    PayPalPaymentStrategy,
    BankTransferPaymentStrategy,
    WalletPaymentStrategy
} from './paymentStrategies';

/**
 * Factory for creating payment strategy instances
 */
export class PaymentStrategyFactory {
    static createStrategy(method: PaymentMethod): IPaymentStrategy {
        switch (method) {
            case PaymentMethod.CREDIT_CARD:
                return new CreditCardPaymentStrategy();
            case PaymentMethod.DEBIT_CARD:
                // Debit card uses similar logic to credit card
                return new CreditCardPaymentStrategy();
            case PaymentMethod.PAYPAL:
                return new PayPalPaymentStrategy();
            case PaymentMethod.BANK_TRANSFER:
                return new BankTransferPaymentStrategy();
            case PaymentMethod.WALLET:
                return new WalletPaymentStrategy();
            default:
                throw new Error(`Unsupported payment method: ${method}`);
        }
    }

    static getSupportedMethods(): PaymentMethod[] {
        return Object.values(PaymentMethod);
    }
}
