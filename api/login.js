import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { user, pass, email, password } = req.body || {};
    // Support both 'user'/'pass' and 'email'/'password' for compatibility
    const username = user || email;
    const pwd = pass || password;

    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_HASH = process.env.ADMIN_HASH;
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
    // Support multiple admin users with different roles via ADMIN_ROLE env var
    // Default to 'superadmin' for the main admin account
    const ADMIN_ROLE = process.env.ADMIN_ROLE || 'superadmin';

    if (!ADMIN_HASH || !JWT_SECRET) return res.status(500).json({ error: 'Server not configured' });
    if (username !== ADMIN_USER) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(pwd + '', ADMIN_HASH);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Use the configured role (superadmin by default for main admin)
    const token = jwt.sign({ sub: username, role: ADMIN_ROLE }, JWT_SECRET, { expiresIn: '8h' });
    const cookie = serialize('digikoder_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600,
    });

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({
      ok: true,
      token,
      email: username,
      role: ADMIN_ROLE,
      isAuthenticated: true
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
}
