import { pathToFileURL } from 'node:url';
import { assertEnv, env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { Category } from './models/Category.js';
import { Expense } from './models/Expense.js';
import { User } from './models/User.js';

const STARTER_CATEGORIES = [
  { name: 'Food & Dining', color: '#ef6c00' },
  { name: 'Transport', color: '#1e88e5' },
  { name: 'Housing', color: '#6d4c41' },
  { name: 'Utilities', color: '#00897b' },
  { name: 'Entertainment', color: '#8e24aa' },
  { name: 'Health', color: '#e53935' },
  { name: 'Shopping', color: '#d81b60' },
  { name: 'Education', color: '#3949ab' },
];

const DEMO_EXPENSES = [
  ['Groceries', 64.5, 'Food & Dining', 'card'],
  ['Bus pass', 30, 'Transport', 'mobile_money'],
  ['Rent', 450, 'Housing', 'bank_transfer'],
  ['Electricity bill', 42.75, 'Utilities', 'mobile_money'],
  ['Cinema tickets', 18, 'Entertainment', 'card'],
  ['Pharmacy', 12.4, 'Health', 'cash'],
  ['Running shoes', 85, 'Shopping', 'card'],
  ['Online course', 25, 'Education', 'card'],
  ['Lunch with friends', 22.3, 'Food & Dining', 'cash'],
  ['Taxi home', 9.5, 'Transport', 'cash'],
  ['Internet', 35, 'Utilities', 'bank_transfer'],
  ['Coffee beans', 14, 'Food & Dining', 'card'],
];

/**
 * Idempotently creates the default + starter categories, the admin
 * account (from ADMIN_* env vars) and, optionally, a demo user with sample data.
 */
export async function seed({ withDemo = true } = {}) {
  await Category.getDefault();
  for (const c of STARTER_CATEGORIES) {
    await Category.updateOne(
      { key: c.name.toLowerCase() },
      { $setOnInsert: { ...c, key: c.name.toLowerCase(), isDefault: false } },
      { upsert: true },
    );
  }
  console.log(`Categories ready (${await Category.countDocuments()})`);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@retain.app').toLowerCase();
  if (!(await User.exists({ email: adminEmail }))) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Retain Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    await User.updateOne({ email: adminEmail }, { role: 'admin' });
    console.log(`Admin exists: ${adminEmail}`);
  }

  if (!withDemo) return;

  const demoEmail = 'demo@retain.app';
  let demo = await User.findOne({ email: demoEmail });
  if (!demo) {
    demo = await User.create({ name: 'Demo User', email: demoEmail, password: 'Demo@12345' });
    const categories = await Category.find();
    const byName = new Map(categories.map((c) => [c.name, c._id]));
    const today = new Date();
    const expenses = [];
    // Spread sample expenses across this month and the previous two months.
    for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
      DEMO_EXPENSES.forEach(([title, amount, category, paymentMethod], i) => {
        const day = Math.min(1 + i * 2, monthOffset === 0 ? today.getUTCDate() : 28);
        expenses.push({
          user: demo._id,
          title,
          amount: Number((amount * (1 - monthOffset * 0.1)).toFixed(2)),
          category: byName.get(category),
          paymentMethod,
          date: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - monthOffset, day)),
        });
      });
    }
    await Expense.insertMany(expenses);
    console.log(`Demo user created: ${demoEmail} / Demo@12345 with ${expenses.length} expenses`);
  }
}

// Allow running directly: `npm run seed`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  assertEnv();
  connectDB(env.mongoUri)
    .then(() => seed({ withDemo: process.argv.includes('--demo') }))
    .then(() => disconnectDB())
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
