import request from 'supertest';
import express from 'express';
import userController from '../controllers/userController';
import userService from '../services/userService';
import { supabase } from '../SupabaseClient';

const app = express();
app.use(express.json());

// User routes
app.post('/users', userController.createUser);
app.get('/users', userController.getUsers);
app.post('/users/search', userController.searchUser);

describe('User Integration Tests', () => {
    const testUserEmail = `testuser-${Date.now()}@example.com`;
    const testUsername = `testuser_${Date.now()}`;
    let createdUserId: number | undefined;

    // Clean up test data after all tests
    afterAll(async () => {
        if (createdUserId) {
            try {
                await supabase.from('users').delete().eq('id', createdUserId);
            } catch (err) {
                console.error('Cleanup error:', err);
            }
        }
    });

    describe('Happy Path: Create User', () => {
        test('should create a new user and verify it exists in the database', async () => {
            const newUser = {
                username: testUsername,
                user_email: testUserEmail,
            };

            // Create user via service
            const createdUsers = await userService.createUser(newUser);
            expect(createdUsers).toHaveLength(1);

            const createdUser = createdUsers[0];
            createdUserId = createdUser.id;

            // Verify user exists in database
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('user_email', testUserEmail)
                .single();

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data.username).toBe(testUsername);
            expect(data.user_email).toBe(testUserEmail);
        });
    });

    describe('Happy Path: Get All Users', () => {
        test('should retrieve all users from database', async () => {
            const users = await userService.getUsers();

            expect(Array.isArray(users)).toBe(true);
            expect(users.length).toBeGreaterThan(0);
            expect(users[0]).toHaveProperty('username');
            expect(users[0]).toHaveProperty('email');
        });
    });

    describe('Happy Path: Search User', () => {
        test('should search for user by username', async () => {
            // Create a user first
            const uniqueUsername = `searchtest_${Date.now()}`;
            await userService.createUser({
                username: uniqueUsername,
                user_email: `search_${Date.now()}@example.com`,
            });

            // Search for the user
            const results = await userService.searchUser(uniqueUsername);

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].username).toContain(uniqueUsername);
        });
    });

    describe('Happy Path: API Endpoint - Create User', () => {
        test('should create user via HTTP POST endpoint', async () => {
            const newUser = {
                username: `apitest_${Date.now()}`,
                user_email: `apitest_${Date.now()}@example.com`,
            };

            const res = await request(app)
                .post('/users')
                .send(newUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body.username).toBe(newUser.username);
            expect(res.body.user_email).toBe(newUser.user_email);

            // Verify it's in the database
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('user_email', newUser.user_email)
                .single();

            expect(data).toBeDefined();
            expect(data.username).toBe(newUser.username);
        });
    });

    describe('Sad Path: Missing Required Fields', () => {
        test('should reject user creation without username', async () => {
            const res = await request(app)
                .post('/users')
                .send({ user_email: 'test@example.com' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('required');
        });

        test('should reject user creation without user_email', async () => {
            const res = await request(app)
                .post('/users')
                .send({ username: 'testuser' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('required');
        });
    });

    describe('Happy Path: Bulk Create Users', () => {
        test('should create multiple users at once', async () => {
            const bulkUsers = [
                { username: `bulk1_${Date.now()}`, user_email: `bulk1_${Date.now()}@example.com` },
                { username: `bulk2_${Date.now()}`, user_email: `bulk2_${Date.now()}@example.com` },
            ];

            const createdUsers = await userService.createUser(bulkUsers);

            expect(createdUsers).toHaveLength(2);
            expect(createdUsers[0].username).toBe(bulkUsers[0].username);
            expect(createdUsers[1].username).toBe(bulkUsers[1].username);

            // Verify both exist in database
            const { data } = await supabase
                .from('users')
                .select('*')
                .in('user_email', bulkUsers.map(u => u.user_email));

            expect(data).toHaveLength(2);
        });
    });
});

