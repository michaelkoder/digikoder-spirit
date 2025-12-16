import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { user, pass } = req.body || {};
    const ADMIN_USER = process.env.ADMIN_USER || 'admin';
    const ADMIN_HASH = process.env.ADMIN_HASH;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!ADMIN_HASH || !JWT_SECRET) return res.status(500).json({ error: 'Server not configured' });
    if (user !== ADMIN_USER) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(pass + '', ADMIN_HASH);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    const cookie = serialize('digikoder_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600,
    });

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
}
