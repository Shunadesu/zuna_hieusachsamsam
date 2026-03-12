import User from './models/User.js';

export async function seedAdmin() {
  const existing = await User.findOne({ role: 'admin' });
  if (existing) return;
  await User.create({
    email: 'admin@localhost',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
  });
  console.log('Created default admin: admin@localhost / admin123');
}
