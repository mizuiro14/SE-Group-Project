import { PaymentService } from '../services/paymentService';
import { PaymentMethod } from '../types/payment';
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

    it('processes a payment successfully (happy)', async () => {
        const mockResponse = { success: true, status: 'completed', transaction_id: 'tx1', message: 'ok' };
        const mockPaymentBefore = { id: 1, amount: 99.99, method: PaymentMethod.CREDIT_CARD, status: 'pending' } as any;
        const mockPaymentAfter = { ...mockPaymentBefore, status: 'completed' } as any;

        jest.spyOn(PaymentStrategyFactory, 'createStrategy').mockReturnValue({ processPayment: jest.fn().mockResolvedValue(mockResponse) } as any);
        jest.spyOn(PaymentService, 'createPayment').mockResolvedValue(mockPaymentBefore as any);
        jest.spyOn(PaymentService, 'updatePaymentStatus').mockResolvedValue(mockPaymentAfter as any);

        const result = await PaymentService.processPayment({ order_id: 1, amount: 99.99, method: PaymentMethod.CREDIT_CARD } as any);

        expect(result.response.success).toBe(true);
        expect(result.payment.status).toBe('completed');
    });

    it('handles error when createPayment fails during processPayment', async () => {
        jest.spyOn(PaymentService, 'createPayment').mockRejectedValue(new Error('createPayment failed'));
        await expect(PaymentService.processPayment({ order_id: 1, amount: 10, method: PaymentMethod.CREDIT_CARD } as any)).rejects.toThrow('createPayment failed');
    });

    it('creates payment record successfully (happy)', async () => {
        const created = { id: 2, order_id: 5, amount: 50, method: PaymentMethod.WALLET, status: 'pending' } as any;
        supabase.__setResult({ data: created, error: null });

        const res = await PaymentService.createPayment(5, 50, PaymentMethod.WALLET);
        expect(res).toEqual(created);
    });

    it('handles error when creating payment record', async () => {
        const error = { message: 'Error creating payment' };
        supabase.__setResult({ data: null, error });
        await expect(PaymentService.createPayment(6, 60, PaymentMethod.CREDIT_CARD)).rejects.toThrow(error.message);
    });

    it('retrieves payment by id successfully (happy)', async () => {
        const payment = { id: 10, order_id: 100, amount: 100, method: PaymentMethod.CREDIT_CARD, status: 'completed' } as any;
        supabase.__setResult({ data: payment, error: null });
        const res = await PaymentService.getPaymentById(10);
        expect(res).toEqual(payment);
    });

    it('returns null when payment by id is not found', async () => {
        supabase.__setResult({ data: null, error: null });
        await expect(PaymentService.getPaymentById(999)).rejects.toThrow('Payment not found');
    });

    it('handles error when updating payment status', async () => {
        const error = { message: 'Error updating payment status' };
        supabase.__setResult({ data: null, error });
        await expect(PaymentService.updatePaymentStatus(1, 'failed')).rejects.toThrow(error.message);
    });

    it('refunds a completed payment successfully (happy)', async () => {
        const existing = { id: 3, amount: 20, method: PaymentMethod.CREDIT_CARD, status: 'completed' } as any;
        const refundResp = { success: true, status: 'refunded', transaction_id: 'r1', message: 'refunded' };
        jest.spyOn(PaymentService, 'getPaymentById').mockResolvedValue(existing as any);
        jest.spyOn(PaymentStrategyFactory, 'createStrategy').mockReturnValue({ refundPayment: jest.fn().mockResolvedValue(refundResp) } as any);
        jest.spyOn(PaymentService, 'updatePaymentStatus').mockResolvedValue({ ...existing, status: 'refunded' } as any);

        const result = await PaymentService.refundPayment(3);
        expect(result.response.success).toBe(true);
        expect(result.payment.status).toBe('refunded');
    });

    it('fails when strategy errors during processing (sad)', async () => {
        jest.spyOn(PaymentStrategyFactory, 'createStrategy').mockReturnValue({ processPayment: jest.fn().mockRejectedValue(new Error('strategy fail')) } as any);
        jest.spyOn(PaymentService, 'createPayment').mockResolvedValue({ id: 4, amount: 10, method: PaymentMethod.CREDIT_CARD, status: 'pending' } as any);

        await expect(PaymentService.processPayment({ order_id: 1, amount: 10, method: PaymentMethod.CREDIT_CARD } as any)).rejects.toThrow('strategy fail');
    });

    it('rejects refund for non-completed payment (sad)', async () => {
        jest.spyOn(PaymentService, 'getPaymentById').mockResolvedValue({ id: 5, amount: 10, method: PaymentMethod.CREDIT_CARD, status: 'pending' } as any);
        await expect(PaymentService.refundPayment(5)).rejects.toThrow('Only completed payments can be refunded');
    });
});
