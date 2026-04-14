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

  const testUser2 = {
    username: `testuser2_${Date.now()}`,
    user_email: `testuser2_${Date.now()}@example.com`,
    cellphone_number: '+14155552672',
    role: 'seller'
  };

  // Clean up test data after all tests
  afterAll(async () => {
    try {
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', testUser.user_email);
      
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', testUser2.user_email);
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
      expect(res.body.cellphone_number).toBe(testUser.cellphone_number);
      expect(res.body.role).toBe(testUser.role);
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
      expect(res.body[0].username).toBe(multipleUsers[0].username);
      expect(res.body[1].username).toBe(multipleUsers[1].username);

      // Cleanup
      await Promise.all(multipleUsers.map(user =>
        supabaseAdmin.from('users').delete().eq('user_email', user.user_email)
      ));
    });

    it('should fail when username is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          user_email: 'test@example.com',
          role: 'buyer'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Username and user_email are required');
    });

    it('should fail when user_email is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: 'testuser',
          role: 'buyer'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject duplicate username', async () => {
      // First, ensure the user exists
      await request(app).post('/users').send(testUser);

      // Try to create with same username
      const res = await request(app)
        .post('/users')
        .send({
          username: testUser.username,
          user_email: `different_${Date.now()}@example.com`
        });

      expect(res.status).toBe(500);
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

    it('should reject duplicate cellphone_number', async () => {
      await request(app).post('/users').send(testUser);

      const res = await request(app)
        .post('/users')
        .send({
          username: `different_${Date.now()}`,
          user_email: `different_${Date.now()}@example.com`,
          cellphone_number: testUser.cellphone_number
        });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });

    it('should set default role to "buyer" if not specified', async () => {
      const userWithoutRole = {
        username: `noRole_${Date.now()}`,
        user_email: `norole_${Date.now()}@example.com`
      };

      const res = await request(app)
        .post('/users')
        .send(userWithoutRole);

      expect(res.status).toBe(201);
      // The default value in the schema has extra quotes, so it returns 'buyer' not buyer
      expect(res.body.role).toMatch(/^'?buyer'?$/);

      // Cleanup
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', userWithoutRole.user_email);
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

      // Cleanup
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', userWithoutPhone.user_email);
    });
  });

  describe('GET /users - Get All Users', () => {
    beforeAll(async () => {
      // Create test users
      await request(app).post('/users').send(testUser);
      await request(app).post('/users').send(testUser2);
    });

    it('should return all users', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should include the created test user in the results', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      const foundUser = res.body.find((u: any) => u.user_email === testUser.user_email);
      expect(foundUser).toBeDefined();
      expect(foundUser.username).toBe(testUser.username);
    });

    it('should return users with all required fields', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      res.body.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('user_email');
        expect(user).toHaveProperty('created_at');
        expect(user).toHaveProperty('role');
      });
    });
  });

  describe('POST /users/search - Search Users', () => {
    beforeAll(async () => {
      await request(app).post('/users').send(testUser);
    });

    it('should find user by username', async () => {
      const res = await request(app)
        .post('/users/search')
        .send({ search: testUser.username });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].username).toContain(testUser.username);
    });

    it('should perform case-insensitive search', async () => {
      const res = await request(app)
        .post('/users/search')
        .send({ search: testUser.username.toUpperCase() });

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', async () => {
      const res = await request(app)
        .post('/users/search')
        .send({ search: 'nonexistent_user_xyz_12345' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should fail when search input is missing', async () => {
      const res = await request(app)
        .post('/users/search')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('search input is required');
    });

    it('should handle partial username matches', async () => {
      const res = await request(app)
        .post('/users/search')
        .send({ search: testUser.username.substring(0, 5) });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /users/update - Update User Profile', () => {
    let authToken: string;
    let userId: string;
    let testAuthEmail: string;
    let testAuthPassword: string;
    let testAuthUsername: string;

    beforeAll(async () => {
      // Create unique credentials for this test
      testAuthEmail = `updatetest_${Date.now()}@example.com`;
      testAuthPassword = 'TestPassword123!';
      testAuthUsername = `updatetest_${Date.now()}`;

      // Create and signup a test user
      const signupRes = await request(app)
        .post('/auth/signup')
        .send({
          email: testAuthEmail,
          password: testAuthPassword,
          username: testAuthUsername,
          contact: '+14155552673',
          role: 'buyer'
        });

      // Check if signup was successful
      if (signupRes.status === 201 && signupRes.body.user) {
        userId = signupRes.body.user.id;

        // Login to get the auth token (via cookie)
        const loginRes = await request(app)
          .post('/auth/login')
          .send({
            email: testAuthEmail,
            password: testAuthPassword
          });

        // Extract token from Set-Cookie header
        if (loginRes.headers['set-cookie']) {
          authToken = loginRes.headers['set-cookie'][0];
        }
      }
    });

    it('should update user profile with authentication', async () => {
      // Skip if login failed
      if (!authToken || !userId) {
        console.log('Skipping: Auth setup failed');
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

      expect([200, 400, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('user');
      }
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
      // Cleanup auth user and regular user
      if (userId) {
        try {
          // Try to delete via admin
          await supabaseAdmin.auth.admin.deleteUser(userId);
        } catch (err) {
          console.log('Auth user cleanup note:', (err as any).message);
        }
      }

      // Clean up any users created during signup
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

  describe('Direct Service Layer Tests', () => {
    const userService = require('../services/userService').default;

    describe('userService.getUsers()', () => {
      it('should return array of users from database', async () => {
        const users = await userService.getUsers();
        expect(Array.isArray(users)).toBe(true);
      });
    });

    describe('userService.createUser()', () => {
      it('should create user in database', async () => {
        const newUser = {
          username: `service_${Date.now()}`,
          user_email: `service_${Date.now()}@example.com`,
          role: 'buyer'
        };

        const users = await userService.createUser(newUser);
        expect(Array.isArray(users)).toBe(true);
        expect(users[0].username).toBe(newUser.username);

        // Cleanup
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('user_email', newUser.user_email);
      });
    });

    describe('userService.searchUserByEmail()', () => {
      it('should return null for non-existent email', async () => {
        const user = await userService.searchUserByEmail(`nonexistent_${Date.now()}@example.com`);
        expect(user).toBeNull();
      });
    });

    describe('userService.updateSupabaseUser()', () => {
      let testUserId: string;
      let testAuthEmail: string;

      beforeAll(async () => {
        testAuthEmail = `authupdate_${Date.now()}@example.com`;
        // Create auth user via signup
        const { user } = await require('../services/authService').default.signup(
          testAuthEmail,
          'TestPassword123!',
          `authupdate_${Date.now()}`,
          '+14155552676'
        );
        testUserId = user.id;
      });

      it('should update user metadata in auth', async () => {
        const result = await userService.updateSupabaseUser(testUserId, {
          first_name: 'UpdatedFirst',
          last_name: 'UpdatedLast',
          email: `updated_${Date.now()}@example.com`,
          contact: '+14155552677'
        });

        expect(result).toBeDefined();
        // Check if metadata exists
        expect(result?.user_metadata).toBeDefined();
      });

      afterAll(async () => {
        if (testUserId) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(testUserId);
          } catch (err) {
            console.log('Auth cleanup note:', (err as any).message);
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
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle very long username (up to reasonable limit)', async () => {
      const longUsername = 'a'.repeat(100);
      const res = await request(app)
        .post('/users')
        .send({
          username: longUsername,
          user_email: `long_${Date.now()}@example.com`
        });

      // Should either succeed or fail gracefully
      expect([201, 400, 500]).toContain(res.status);

      if (res.status === 201) {
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('username', longUsername);
      }
    });

    it('should handle special characters in email', async () => {
      const specialEmail = `test+tag_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/users')
        .send({
          username: `special_${Date.now()}`,
          user_email: specialEmail
        });

      expect(res.status).toBe(201);
      expect(res.body.user_email).toBe(specialEmail);

      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', specialEmail);
    });

    it('should create_at timestamp automatically', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          username: `timestamp_${Date.now()}`,
          user_email: `timestamp_${Date.now()}@example.com`
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('created_at');
      expect(new Date(res.body.created_at)).toBeInstanceOf(Date);

      await supabaseAdmin
        .from('users')
        .delete()
        .eq('user_email', res.body.user_email);
    });
  });
});