import { PaymentService } from '../services/paymentService';
import { PaymentMethod } from '../types/payment';
import { PaymentStrategyFactory } from '../strategies/paymentStrategyFactory';
import { CreditCardPaymentStrategy } from '../strategies/paymentStrategies';

describe('Payment System Tests', () => {
    // ===== HAPPY PATH TESTS (3) =====

    describe('Happy Path: Credit Card Payment Processing', () => {
        test('should process credit card payment successfully', async () => {
            const strategy = new CreditCardPaymentStrategy();
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
        });
    });

    describe('Happy Path: Payment Service Integration', () => {
        test('should process payment through service', async () => {
            const result = await PaymentService.processPayment({
                order_id: 1,
                amount: 99.99,
                method: PaymentMethod.CREDIT_CARD
            });

            expect(result.payment).toBeDefined();
            expect(result.response.success).toBe(true);
            expect(result.response.payment_id).toBe(result.payment.id);
        });
    });

    describe('Happy Path: Payment Statistics', () => {
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

    // ===== SAD PATH TESTS (2) =====

    describe('Sad Path: Unsupported Payment Method', () => {
        test('should throw error for unsupported payment method', () => {
            expect(() => {
                PaymentStrategyFactory.createStrategy('invalid' as PaymentMethod);
            }).toThrow('Unsupported payment method: invalid');
        });
    });

    describe('Sad Path: Refund Non-Completed Payment', () => {
        test('should reject refund for non-completed payment', async () => {
            await expect(PaymentService.refundPayment(999)).rejects.toThrow();
        });
    });
});
