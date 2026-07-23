(async () => {
  try {
    const base = process.env.BASE_URL || 'http://localhost:5000';
    const email = `demo+${Date.now()}@example.com`;
    const password = 'P@ssw0rd!';
    const phone = '09' + String(Date.now()).slice(-8);

    console.log('Base URL:', base);
    console.log('Registering demo user:', email);

    const regResp = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Demo User', email, password, phone })
    });
    const regJson = await regResp.json();
    console.log('Register status:', regResp.status, regJson);

    console.log('Logging in...');
    const loginResp = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginJson = await loginResp.json();
    const setCookie = loginResp.headers.get('set-cookie') || loginResp.headers.get('Set-Cookie') || '';
    console.log('Login status:', loginResp.status, loginJson);
    console.log('Set-Cookie:', setCookie);

    const cookie = setCookie.split(';')[0];

    console.log('Calling /refresh using cookie...');
    const refreshResp = await fetch(`${base}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cookie': cookie }
    });
    const refreshJson = await refreshResp.json();
    const setCookie2 = refreshResp.headers.get('set-cookie') || '';
    console.log('Refresh status:', refreshResp.status, refreshJson, 'set-cookie:', setCookie2);

    console.log('Calling /logout to revoke token...');
    const logoutResp = await fetch(`${base}/api/auth/logout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cookie': setCookie2.split(';')[0] || cookie }
    });
    console.log('Logout status:', logoutResp.status, await logoutResp.json());

    // Use prisma client to find user and insert email verification token
    const { prisma } = require('../src/config/database');
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      console.error('User not found in DB after registration');
      process.exit(1);
    }

    const crypto = require('crypto');
    const tokenRaw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    await prisma.email_verifications.create({ data: { user_id: user.id, token_hash: tokenHash, expires_at: expiresAt } });
    console.log('Inserted email verification token for user id', user.id);
    console.log('Raw verification token (use to call API):', tokenRaw);

    console.log('Calling verify-email endpoint...');
    const verifyResp = await fetch(`${base}/api/auth/verify-email?token=${tokenRaw}`);
    console.log('Verify status:', verifyResp.status, await verifyResp.json());

    const userAfter = await prisma.users.findUnique({ where: { email } });
    console.log('User email_verified_at:', userAfter.email_verified_at);

    process.exit(0);
  } catch (err) {
    console.error('E2E script error:', err);
    process.exit(1);
  }
})();
