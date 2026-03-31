import { PaymentService } from '../services/paymentService';
import { PaymentMethod } from '../types/payment';
import { PaymentStrategyFactory } from '../strategies/paymentStrategyFactory';
import {
    CreditCardPaymentStrategy,
    PayPalPaymentStrategy,
    BankTransferPaymentStrategy,
    WalletPaymentStrategy
} from '../strategies/paymentStrategies';

describe('Payment System Tests', () => {
    describe('Payment Strategy Factory', () => {
        test('should create CreditCardPaymentStrategy for CREDIT_CARD method', () => {
            const strategy = PaymentStrategyFactory.createStrategy(PaymentMethod.CREDIT_CARD);
            expect(strategy).toBeInstanceOf(CreditCardPaymentStrategy);
        });

        test('should create PayPalPaymentStrategy for PAYPAL method', () => {
            const strategy = PaymentStrategyFactory.createStrategy(PaymentMethod.PAYPAL);
            expect(strategy).toBeInstanceOf(PayPalPaymentStrategy);
        });

        test('should create BankTransferPaymentStrategy for BANK_TRANSFER method', () => {
            const strategy = PaymentStrategyFactory.createStrategy(PaymentMethod.BANK_TRANSFER);
            expect(strategy).toBeInstanceOf(BankTransferPaymentStrategy);
        });

        test('should create WalletPaymentStrategy for WALLET method', () => {
            const strategy = PaymentStrategyFactory.createStrategy(PaymentMethod.WALLET);
            expect(strategy).toBeInstanceOf(WalletPaymentStrategy);
        });

        test('should throw error for unsupported payment method', () => {
            expect(() => {
                PaymentStrategyFactory.createStrategy('invalid' as PaymentMethod);
            }).toThrow('Unsupported payment method: invalid');
        });

        test('should return all supported payment methods', () => {
            const methods = PaymentStrategyFactory.getSupportedMethods();
            expect(methods).toContain(PaymentMethod.CREDIT_CARD);
            expect(methods).toContain(PaymentMethod.PAYPAL);
            expect(methods).toContain(PaymentMethod.BANK_TRANSFER);
            expect(methods).toContain(PaymentMethod.WALLET);
        });
    });

    describe('Credit Card Payment Strategy', () => {
        const strategy = new CreditCardPaymentStrategy();

        test('should process credit card payment successfully', async () => {
            const response = await strategy.processPayment({
                order_id: 1,
                amount: 99.99,
                method: PaymentMethod.CREDIT_CARD,
                metadata: {
                    cardNumber: '4111111111111111',
                    expiryDate: '12/25',
                    cvc: '123'
                }
            });

            expect(response.success).toBe(true);
            expect(response.status).toBe('completed');
            expect(response.transaction_id).toBeDefined();
            expect(response.message).toContain('successfully');
        });

        test('should fail for invalid amount', async () => {
            const response = await strategy.processPayment({
                order_id: 1,
                amount: -10,
                method: PaymentMethod.CREDIT_CARD
            });

            expect(response.success).toBe(false);
            expect(response.status).toBe('failed');
        });

        test('should refund credit card payment successfully', async () => {
            const response = await strategy.refundPayment(1, 99.99);

            expect(response.success).toBe(true);
            expect(response.status).toBe('refunded');
            expect(response.transaction_id).toBeDefined();
        });

        test('should validate valid credit card details', async () => {
            const isValid = await strategy.validatePaymentDetails({
                cardNumber: '4111111111111111',
                expiryDate: '12/25',
                cvc: '123'
            });

            expect(isValid).toBe(true);
        });

        test('should reject invalid card number', async () => {
            const isValid = await strategy.validatePaymentDetails({
                cardNumber: 'invalid',
                expiryDate: '12/25',
                cvc: '123'
            });

            expect(isValid).toBe(false);
        });

        test('should reject invalid expiry date', async () => {
            const isValid = await strategy.validatePaymentDetails({
                cardNumber: '4111111111111111',
                expiryDate: 'invalid',
                cvc: '123'
            });

            expect(isValid).toBe(false);
        });

        test('should reject invalid CVC', async () => {
            const isValid = await strategy.validatePaymentDetails({
                cardNumber: '4111111111111111',
                expiryDate: '12/25',
                cvc: 'invalid'
            });

            expect(isValid).toBe(false);
        });
    });

    describe('PayPal Payment Strategy', () => {
        const strategy = new PayPalPaymentStrategy();

        test('should process PayPal payment successfully', async () => {
            const response = await strategy.processPayment({
                order_id: 1,
                amount: 99.99,
                method: PaymentMethod.PAYPAL,
                metadata: {
                    email: 'customer@example.com'
                }
            });

            expect(response.success).toBe(true);
            expect(response.status).toBe('completed');
            expect(response.transaction_id).toBeDefined();
        });

        test('should validate valid PayPal email', async () => {
            const isValid = await strategy.validatePaymentDetails({
                email: 'customer@example.com'
            });

            expect(isValid).toBe(true);
        });

        test('should reject invalid email', async () => {
            const isValid = await strategy.validatePaymentDetails({
                email: 'invalid-email'
            });

            expect(isValid).toBe(false);
        });
    });

    describe('Bank Transfer Payment Strategy', () => {
        const strategy = new BankTransferPaymentStrategy();

        test('should initiate bank transfer with pending status', async () => {
            const response = await strategy.processPayment({
                order_id: 1,
                amount: 99.99,
                method: PaymentMethod.BANK_TRANSFER,
                metadata: {
                    accountNumber: '12345678901234',
                    routingNumber: '123456789',
                    bankCode: 'BANK'
                }
            });

            expect(response.success).toBe(true);
            expect(response.status).toBe('pending');
            expect(response.message).toContain('business days');
        });

        test('should refund bank transfer with pending status', async () => {
            const response = await strategy.refundPayment(1, 99.99);

            expect(response.success).toBe(true);
            expect(response.status).toBe('pending');
        });

        test('should validate valid bank details', async () => {
            const isValid = await strategy.validatePaymentDetails({
                accountNumber: '12345678901234',
                routingNumber: '123456789',
                bankCode: 'BANK'
            });

            expect(isValid).toBe(true);
        });

        test('should reject invalid account number', async () => {
            const isValid = await strategy.validatePaymentDetails({
                accountNumber: 'invalid',
                routingNumber: '123456789',
                bankCode: 'BANK'
            });

            expect(isValid).toBe(false);
        });
    });

    describe('Wallet Payment Strategy', () => {
        const strategy = new WalletPaymentStrategy();

        test('should process wallet payment successfully', async () => {
            const response = await strategy.processPayment({
                order_id: 1,
                amount: 99.99,
                method: PaymentMethod.WALLET,
                metadata: {
                    walletId: 'WALLET_123',
                    balance: 500
                }
            });

            expect(response.success).toBe(true);
            expect(response.status).toBe('completed');
        });

        test('should validate valid wallet details', async () => {
            const isValid = await strategy.validatePaymentDetails({
                walletId: 'WALLET_123',
                balance: 100
            });

            expect(isValid).toBe(true);
        });

        test('should reject invalid wallet balance', async () => {
            const isValid = await strategy.validatePaymentDetails({
                walletId: 'WALLET_123',
                balance: -10
            });

            expect(isValid).toBe(false);
        });
    });

    describe('Payment Service Integration', () => {
        test('should create payment record in database', async () => {
            // Note: This test requires a real/mock Supabase connection
            // Mock this in your test setup
            const payment = await PaymentService.createPayment(1, 99.99, PaymentMethod.CREDIT_CARD);

            expect(payment).toBeDefined();
            expect(payment.order_id).toBe(1);
            expect(payment.amount).toBe(99.99);
            expect(payment.method).toBe(PaymentMethod.CREDIT_CARD);
            expect(payment.status).toBe('pending');
        });

        test('should retrieve payment by ID', async () => {
            const payment = await PaymentService.getPaymentById(1);

            expect(payment).toBeDefined();
            expect(payment.id).toBe(1);
        });

        test('should retrieve payments by order ID', async () => {
            const payments = await PaymentService.getPaymentsByOrderId(1);

            expect(Array.isArray(payments)).toBe(true);
            payments.forEach(payment => {
                expect(payment.order_id).toBe(1);
            });
        });

        test('should update payment status', async () => {
            const payment = await PaymentService.updatePaymentStatus(1, 'completed');

            expect(payment.status).toBe('completed');
            expect(new Date(payment.updated_at)).toBeInstanceOf(Date);
        });

        test('should process payment through service', async () => {
            const result = await PaymentService.processPayment({
                order_id: 1,
                amount: 99.99,
                method: PaymentMethod.CREDIT_CARD
            });

            expect(result.payment).toBeDefined();
            expect(result.response).toBeDefined();
            expect(result.response.payment_id).toBe(result.payment.id);
        });

        test('should refund completed payment', async () => {
            // First create and complete a payment
            const paymentResult = await PaymentService.processPayment({
                order_id: 1,
                amount: 99.99,
                method: PaymentMethod.CREDIT_CARD
            });

            // Then refund it
            const refundResult = await PaymentService.refundPayment(paymentResult.payment.id);

            expect(refundResult.payment.status).toBe('refunded');
            expect(refundResult.response.success).toBe(true);
        });

        test('should reject refund for non-completed payment', async () => {
            // Try to refund a pending payment
            expect(async () => {
                await PaymentService.refundPayment(1); // assuming ID 1 is pending
            }).rejects.toThrow();
        });

        test('should get payment statistics', async () => {
            const stats = await PaymentService.getPaymentStatistics({
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            });

            expect(stats).toBeDefined();
            expect(stats.totalPayments).toBeGreaterThanOrEqual(0);
            expect(stats.totalAmount).toBeGreaterThanOrEqual(0);
            expect(stats.byMethod).toBeDefined();
            expect(stats.byStatus).toBeDefined();
        });
    });
});
