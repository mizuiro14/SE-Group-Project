import { PaymentService } from '../services/paymentService';
import { PaymentType } from '../types/payment';
import { PaymentStrategyFactory } from '../strategies/paymentStrategyFactory';

jest.mock('../SupabaseClient', () => {
    let result: any = { data: null, error: null };
    const chain: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(async () => result),
        order: jest.fn(async () => result),
        range: jest.fn().mockReturnThis(),
    };
    chain.then = (onFulfilled: any) => Promise.resolve(onFulfilled(result));
    return { supabase: { from: jest.fn(() => chain), __setResult: (r: any) => (result = r) } };
});

describe('Payment Service Unit Tests', () => {
    const { supabase } = require('../SupabaseClient');

    beforeEach(() => { jest.clearAllMocks(); jest.restoreAllMocks(); });

    it('creates a payment method successfully (happy)', async () => {
        const mockPayment = { id: 1, user_id: 10, type: PaymentType.CREDIT_CARD, is_default: true } as any;
        jest.spyOn(PaymentStrategyFactory, 'createStrategy').mockReturnValue({
            validateDetails: jest.fn().mockResolvedValue(true),
            normalizeDetails: jest.fn().mockReturnValue({ cardLast4: '1111', expiryDate: '12/30', cvcPresent: true })
        } as any);
        supabase.__setResult({ data: mockPayment, error: null });

        const result = await PaymentService.createPaymentMethod({
            user_id: 10,
            type: PaymentType.CREDIT_CARD,
            is_default: true,
            details: { cardNumber: '4111111111111111', expiryDate: '12/30', cvc: '123' }
        } as any);

        expect(result).toEqual(mockPayment);
    });

    it('fails to create payment method when details are invalid', async () => {
        jest.spyOn(PaymentStrategyFactory, 'createStrategy').mockReturnValue({
            validateDetails: jest.fn().mockResolvedValue(false),
            normalizeDetails: jest.fn()
        } as any);

        await expect(PaymentService.createPaymentMethod({
            user_id: 10,
            type: PaymentType.CREDIT_CARD,
            details: {}
        } as any)).rejects.toThrow('Invalid payment details for selected payment type');
    });

    it('retrieves payment by id successfully (happy)', async () => {
        const payment = { id: 10, user_id: 100, type: PaymentType.CREDIT_CARD, is_default: true } as any;
        supabase.__setResult({ data: payment, error: null });
        const res = await PaymentService.getPaymentById(10);
        expect(res).toEqual(payment);
    });

    it('returns null when payment by id is not found', async () => {
        supabase.__setResult({ data: null, error: null });
        await expect(PaymentService.getPaymentById(999)).rejects.toThrow('Payment not found');
    });

    it('updates payment method details successfully (happy)', async () => {
        const existing = { id: 3, user_id: 7, type: PaymentType.PAYPAL, is_default: false, details: { email: 'old@x.com' } } as any;
        const updated = { ...existing, details: { email: 'new@x.com' } } as any;
        jest.spyOn(PaymentService, 'getPaymentById').mockResolvedValue(existing);
        jest.spyOn(PaymentStrategyFactory, 'createStrategy').mockReturnValue({
            validateDetails: jest.fn().mockResolvedValue(true),
            normalizeDetails: jest.fn().mockReturnValue({ email: 'new@x.com' })
        } as any);
        supabase.__setResult({ data: updated, error: null });

        const res = await PaymentService.updatePaymentMethod(3, { details: { email: 'new@x.com' } });
        expect(res).toEqual(updated);
    });

    it('rejects update when no fields provided', async () => {
        await expect(PaymentService.updatePaymentMethod(1, {})).rejects.toThrow('No updates provided');
    });

    it('deletes payment method successfully (happy)', async () => {
        supabase.__setResult({ data: null, error: null });
        await expect(PaymentService.deletePaymentMethod(5)).resolves.toBeUndefined();
    });
});
