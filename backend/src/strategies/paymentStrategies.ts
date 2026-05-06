import { IPaymentStrategy } from '../types/payment';

/**
 * Credit Card Payment Strategy
 */
export class CreditCardPaymentStrategy implements IPaymentStrategy {
    async validateDetails(details: Record<string, any>): Promise<boolean> {
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

    normalizeDetails(details: Record<string, any>): Record<string, any> {
        const { cardNumber, expiryDate, cvc, ...rest } = details;
        const sanitized = typeof cardNumber === 'string' ? cardNumber.replace(/\s/g, '') : '';
        const last4 = sanitized.slice(-4);

        return {
            ...rest,
            cardLast4: last4,
            expiryDate,
            cvcPresent: Boolean(cvc)
        };
    }
}

/**
 * PayPal Payment Strategy
 */
export class PayPalPaymentStrategy implements IPaymentStrategy {
    async validateDetails(details: Record<string, any>): Promise<boolean> {
        // Validate PayPal email
        const { email } = details;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return false;
        }

        return true;
    }

    normalizeDetails(details: Record<string, any>): Record<string, any> {
        const { email, ...rest } = details;

        return {
            ...rest,
            email: typeof email === 'string' ? email.toLowerCase() : email
        };
    }
}

/**
 * Bank Transfer Payment Strategy
 */
export class BankTransferPaymentStrategy implements IPaymentStrategy {
    async validateDetails(details: Record<string, any>): Promise<boolean> {
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

    normalizeDetails(details: Record<string, any>): Record<string, any> {
        const { accountNumber, routingNumber, bankCode, ...rest } = details;
        const sanitized = typeof accountNumber === 'string' ? accountNumber.replace(/\s/g, '') : '';
        const last4 = sanitized.slice(-4);

        return {
            ...rest,
            accountLast4: last4,
            routingNumber,
            bankCode
        };
    }
}

/**
 * Wallet Payment Strategy
 */
export class WalletPaymentStrategy implements IPaymentStrategy {
    async validateDetails(details: Record<string, any>): Promise<boolean> {
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

    normalizeDetails(details: Record<string, any>): Record<string, any> {
        return { ...details };
    }
}
