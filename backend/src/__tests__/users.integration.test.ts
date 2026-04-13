import request from 'supertest';
import express from 'express';
import userController from '../controllers/userController';
import userService from '../services/userService';

jest.mock('../services/userService');

const app = express();
app.use(express.json());

app.post('/users', userController.createUser);
app.get('/users', userController.getUsers);
app.post('/users/search', userController.searchUser);

describe('User Controller Integration Tests', () => {
    beforeEach(() => jest.clearAllMocks());

    it('creates a user via HTTP POST (happy)', async () => {
        const payload = { username: 'intuser', user_email: 'int@example.com' };
        (userService.createUser as jest.Mock).mockResolvedValue([{ id: 1, ...payload }]);

        const res = await request(app).post('/users').send(payload);
        expect(res.statusCode).toEqual(201);
        expect(res.body.username).toBe(payload.username);
    });

    it('gets all users (happy)', async () => {
        const users = [{ id: 2, username: 'u', user_email: 'u@example.com' }];
        (userService.getUsers as jest.Mock).mockResolvedValue(users);

        const res = await request(app).get('/users');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(users);
    });

    it('searches users (happy)', async () => {
        const results = [{ id: 3, username: 'searchme', user_email: 's@example.com' }];
        (userService.searchUser as jest.Mock).mockResolvedValue(results);

        const res = await request(app).post('/users/search').send({ search: 'searchme' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(results);
    });

    it('returns 400 when creating user with missing fields (sad)', async () => {
        const res = await request(app).post('/users').send({ user_email: 'bad@example.com' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('required');
    });

    it('returns 400 when search payload is missing (sad)', async () => {
        const res = await request(app).post('/users/search').send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('required');
    });
});
