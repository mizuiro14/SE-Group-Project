import { IPaymentStrategy, PaymentType } from '../types/payment';
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
    static createStrategy(type: PaymentType): IPaymentStrategy {
        switch (type) {
            case PaymentType.CREDIT_CARD:
                return new CreditCardPaymentStrategy();
            case PaymentType.DEBIT_CARD:
                // Debit card uses similar logic to credit card
                return new CreditCardPaymentStrategy();
            case PaymentType.PAYPAL:
                return new PayPalPaymentStrategy();
            case PaymentType.BANK_TRANSFER:
                return new BankTransferPaymentStrategy();
            case PaymentType.WALLET:
                return new WalletPaymentStrategy();
            default:
                throw new Error(`Unsupported payment type: ${type}`);
        }
    }

    static getSupportedTypes(): PaymentType[] {
        return Object.values(PaymentType);
    }
}
