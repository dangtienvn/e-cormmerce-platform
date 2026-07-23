const request = require('supertest');
const express = require('express');
// Set env vars for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// Mock repositories and mailer BEFORE loading the auth route/controller
jest.mock('../src/modules/user/user.repository', () => ({
  findOneByEmail: jest.fn(),
  matchPassword: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  setEmailVerified: jest.fn(),
}));

jest.mock('../src/modules/auth/refresh-token.repository', () => ({
  create: jest.fn(),
  findByTokenHash: jest.fn(),
  deleteById: jest.fn(),
  deleteByTokenHash: jest.fn(),
}));

jest.mock('../src/modules/auth/email-verification.repository', () => ({
  createToken: jest.fn(),
  findByTokenHash: jest.fn(),
  deleteById: jest.fn(),
  deleteByUserId: jest.fn(),
}));

jest.mock('../src/modules/user/password-reset.repository', () => ({
  createToken: jest.fn(),
  findByTokenHash: jest.fn(),
  deleteById: jest.fn(),
  deleteByUserId: jest.fn(),
}));

jest.mock('../src/utils/mailer', () => ({
  sendResetPasswordEmail: jest.fn(),
  sendSetPasswordInviteEmail: jest.fn(),
  sendInvoiceEmail: jest.fn(),
  sendPaymentSuccessEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  paymentMethodLabel: jest.fn(),
}));

const UserRepository = require('../src/modules/user/user.repository');
const RefreshTokenRepository = require('../src/modules/auth/refresh-token.repository');
const EmailVerificationRepository = require('../src/modules/auth/email-verification.repository');
const Mailer = require('../src/utils/mailer');

// Now require the auth route (it will use the mocked modules)
const authRoute = require('../src/modules/auth/auth.route');

// Setup express app for testing
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoute);
  // error handler to make tests fail with stack traces
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  });
  return app;
}

describe('Auth flow tests (login -> refresh -> logout -> verify)', () => {
  let app;

  beforeEach(() => {
    app = buildApp();
    jest.clearAllMocks();
  });

  test('Login sets HttpOnly refresh cookie and returns access token', async () => {
    const email = 'test@example.com';
    const password = 'P@ssw0rd!';

    UserRepository.findOneByEmail.mockResolvedValue({
      id: 1,
      email,
      password: 'hashed',
      role_name: 'customer',
      full_name: 'Test User',
      avatar_url: null
    });
    UserRepository.matchPassword.mockResolvedValue(true);
    RefreshTokenRepository.create.mockResolvedValue({ id: 10 });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.token || res.body.accessToken).toBeDefined();
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie.some(c => c.includes('refreshToken='))).toBe(true);
  });

  test('Refresh rotates refresh token and returns new access token', async () => {
    const rawRefresh = 'raw-refresh-token';
    const user = { id: 2, email: 'r@example.com', role_name: 'customer' };

    // findByTokenHash should return a record with user id and future expiry
    RefreshTokenRepository.findByTokenHash.mockResolvedValue({
      id: 11,
      user_id: user.id,
      expires_at: new Date(Date.now() + 1000 * 60 * 60),
      users: user
    });
    RefreshTokenRepository.create.mockResolvedValue({ id: 12 });
    RefreshTokenRepository.deleteById.mockResolvedValue(true);
    UserRepository.findById.mockResolvedValue(user);

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('x-refresh-token', rawRefresh)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.token || res.body.accessToken).toBeDefined();
    // rotated cookie
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie.some(c => c.includes('refreshToken='))).toBe(true);
  });

  test('Logout revokes refresh token and clears cookie', async () => {
    const rawRefresh = 'raw-logout-token';
    RefreshTokenRepository.deleteByTokenHash.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/logout')
      .set('x-refresh-token', rawRefresh)
      .expect(200);

    expect(res.body.success).toBe(true);
    const setCookie = res.headers['set-cookie'] || [];
    // cookie cleared
    expect(setCookie.some(c => c.includes('refreshToken=;'))).toBe(true);
  });

  test('Verify email endpoint validates token and marks email verified', async () => {
    const tokenRaw = 'verify-token-xyz';
    EmailVerificationRepository.findByTokenHash.mockResolvedValue({
      id: 21,
      user_id: 5,
      expires_at: new Date(Date.now() + 1000 * 60 * 60),
      users: { id: 5, email: 'v@example.com' }
    });
    EmailVerificationRepository.deleteById.mockResolvedValue(true);
    UserRepository.setEmailVerified.mockResolvedValue(true);

    const res = await request(app)
      .get(`/api/auth/verify-email?token=${tokenRaw}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(UserRepository.setEmailVerified).toHaveBeenCalledWith(5);
  });
});
