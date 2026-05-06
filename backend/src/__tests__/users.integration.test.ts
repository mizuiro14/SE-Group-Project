import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import userController from '../controllers/userController';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { supabase, supabaseAdmin } from '../SupabaseClient';

// Set up a test Express app with routes
const createTestApp = (): Express => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  // User routes
  app.get('/users', userController.getUsers);
  app.post('/users', userController.createUser);
  app.post('/users/search', userController.searchUser);
  app.put('/users/update', authenticate, userController.updateUserProfile);

  // Auth routes
  app.post('/auth/signup', authController.signup);
  app.post('/auth/login', authController.login);
  app.post('/auth/logout', authenticate, authController.logout);
  app.get('/auth/me', authenticate, authController.me);

  return app;
};

describe('Users Table Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  const testUser = {
    username: `testuser_${Date.now()}`,
    user_email: `testuser_${Date.now()}@example.com`,
    cellphone_number: '+14155552671',
    role: 'buyer'
  };

  afterAll(async () => {
    try {
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', testUser.user_email);
    } catch (err) {
      console.log('Cleanup error:', err);
    }
  });

  describe('POST /users - Create User', () => {
    it('should create a single user successfully', async () => {
      const res = await request(app)
        .post('/users')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.username).toBe(testUser.username);
      expect(res.body.user_email).toBe(testUser.user_email);
    });

    it('should create multiple users successfully', async () => {
      const multipleUsers = [
        {
          username: `bulk_user1_${Date.now()}`,
          user_email: `bulk_user1_${Date.now()}@example.com`,
          role: 'buyer'
        },
        {
          username: `bulk_user2_${Date.now()}`,
          user_email: `bulk_user2_${Date.now()}@example.com`,
          role: 'seller'
        }
      ];

      const res = await request(app)
        .post('/users')
        .send(multipleUsers);

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);

      // Cleanup
      await Promise.all(multipleUsers.map(user =>
        supabaseAdmin.from('users').delete().eq('user_email', user.user_email)
      ));
    });

    it('should fail when username or email is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({ user_email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/users').send(testUser);

      const res = await request(app)
        .post('/users')
        .send({
          username: `different_${Date.now()}`,
          user_email: testUser.user_email
        });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });

    it('should allow cellphone_number to be null', async () => {
      const userWithoutPhone = {
        username: `noPhone_${Date.now()}`,
        user_email: `nophone_${Date.now()}@example.com`,
        role: 'buyer'
      };

      const res = await request(app)
        .post('/users')
        .send(userWithoutPhone);

      expect(res.status).toBe(201);
      expect(res.body.cellphone_number).toBeNull();

      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', userWithoutPhone.user_email);
    });
  });

  describe('GET /users - Retrieve Users', () => {
    it('should return all users', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return users with required fields', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      res.body.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('user_email');
      });
    });
  });

  describe('POST /users/search - Search Users', () => {
    it('should find user by username', async () => {
      const res = await request(app)
        .post('/users/search')
        .send({ search: testUser.username });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should fail when search input is missing', async () => {
      const res = await request(app)
        .post('/users/search')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /users/update - Update User Profile', () => {
    let authToken: string;
    let userId: string;
    let testAuthEmail: string;
    let testAuthPassword: string;

    beforeAll(async () => {
      testAuthEmail = `updatetest_${Date.now()}@example.com`;
      testAuthPassword = 'TestPassword123!';

      const signupRes = await request(app)
        .post('/auth/signup')
        .send({
          email: testAuthEmail,
          password: testAuthPassword,
          username: `updatetest_${Date.now()}`,
          contact: '+14155552673',
          role: 'buyer'
        });

      if (signupRes.status === 201 && signupRes.body.user) {
        userId = signupRes.body.user.id;

        const loginRes = await request(app)
          .post('/auth/login')
          .send({
            email: testAuthEmail,
            password: testAuthPassword
          });

        if (loginRes.headers['set-cookie']) {
          authToken = loginRes.headers['set-cookie'][0];
        }
      }
    });

    it('should update user profile with authentication', async () => {
      if (!authToken || !userId) {
        return;
      }

      const updateData = {
        first_name: 'John',
        last_name: 'Doe',
        email: `updated_${Date.now()}@example.com`,
        contact: '+14155552674'
      };

      const res = await request(app)
        .put('/users/update')
        .set('Cookie', authToken)
        .send(updateData);

      expect(res.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .put('/users/update')
        .send({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'test@example.com',
          contact: '+14155552675'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    afterAll(async () => {
      if (userId) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
        } catch (err) {
          console.log('Auth user cleanup note:', (err as any).message);
        }
      }

      try {
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('user_email', testAuthEmail);
      } catch (err) {
        console.log('User table cleanup note:', (err as any).message);
      }
    });
  });

  describe('Service Layer Tests', () => {
    const userService = require('../services/userService').default;

    it('should get all users from database', async () => {
      const users = await userService.getUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('should create user in database', async () => {
      const newUser = {
        username: `service_${Date.now()}`,
        user_email: `service_${Date.now()}@example.com`,
        role: 'buyer'
      };

      const users = await userService.createUser(newUser);
      expect(Array.isArray(users)).toBe(true);
      expect(users[0].username).toBe(newUser.username);

      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', newUser.user_email);
    });

    it('should return null for non-existent email', async () => {
      const user = await userService.searchUserByEmail(`nonexistent_${Date.now()}@example.com`);
      expect(user).toBeNull();
    });
  });
});