import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default function handler(req, res) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return res.status(500).json({ error: 'Server not configured' });

    const cookieHeader = req.headers.cookie || '';
    const cookies = parse(cookieHeader || '');
    const token = cookies.digikoder_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ error: 'no token' });

    const payload = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ email: payload.sub, role: payload.role });
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}
