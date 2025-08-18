import bcrypt from 'bcryptjs';

(async () => {
  const rawPassword = 'admin123';
  const hashed = await bcrypt.hash(rawPassword, 10);
  console.log('✅ New Hash for admin123:\n', hashed);
})();
