import { getUsers, createUser, searchUser, searchUserByEmail } from '../services/userService';

jest.mock('../SupabaseClient', () => {
    let result: any = { data: null, error: null };
    const chain: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(async () => result),
        ilike: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
    };

    // make the chain thenable so `await chain` yields the current result
    chain.then = (onFulfilled: any) => Promise.resolve(onFulfilled(result));

    return {
        supabase: { from: jest.fn(() => chain), __setResult: (r: any) => (result = r) },
        supabaseAdmin: { from: jest.fn(() => chain), auth: { admin: { updateUserById: jest.fn() } }, __setResult: (r: any) => (result = r) }
    };
});

describe('User Service Unit Tests', () => {
    const { supabase, supabaseAdmin } = require('../SupabaseClient');

    beforeEach(() => { jest.clearAllMocks(); jest.restoreAllMocks(); });

    it('retrieves all users (happy)', async () => {
        const users = [{ id: 1, username: 'u1', user_email: 'u1@example.com' }];
        supabase.__setResult({ data: users, error: null });
        const res = await getUsers();
        expect(res).toEqual(users);
    });

    it('creates a user successfully (happy)', async () => {
        const created = [{ id: 2, username: 'u2', user_email: 'u2@example.com' }];
        supabaseAdmin.__setResult({ data: created, error: null });
        const res = await createUser({ username: 'u2', user_email: 'u2@example.com' } as any);
        expect(res).toEqual(created);
    });

    it('searches for a user by username (happy)', async () => {
        const found = [{ id: 3, username: 'searchme', user_email: 's@example.com' }];
        supabase.__setResult({ data: found, error: null });
        const res = await searchUser('searchme');
        expect(res).toEqual(found);
    });

    it('returns null when searching by email not found (sad)', async () => {
        supabase.__setResult({ data: null, error: { code: 'PGRST116' } });
        const res = await searchUserByEmail('noone@example.com');
        expect(res).toBeNull();
    });

    it('throws when createUser fails in admin client (sad)', async () => {
        supabaseAdmin.__setResult({ data: null, error: { message: 'admin insert failed' } });
        await expect(createUser({ username: 'bad', user_email: 'bad@example.com' } as any)).rejects.toThrow('admin insert failed');
    });
});

