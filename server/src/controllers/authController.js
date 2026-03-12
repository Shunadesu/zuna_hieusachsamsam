import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

export async function register(req, res) {
  try {
    const { email, password, name, phone, address } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Email, password and name required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ email, password, name, phone, address, role: 'member' });
    const token = signToken(user);
    res.status(201).json({ user: { _id: user._id, email: user.email, name: user.name, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
    const token = signToken(user);
    res.json({ user: { _id: user._id, email: user.email, name: user.name, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
