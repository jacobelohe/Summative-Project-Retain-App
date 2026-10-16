/**
 * Runs the API against a throwaway in-memory MongoDB, seeded with the
 * admin, categories and a demo user. Handy for trying the app without Atlas.
 *
 *   npm run dev:memory
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('retain');
process.env.JWT_SECRET ||= 'dev-only-secret';

const { connectDB } = await import('../src/config/db.js');
const { seed } = await import('../src/seed.js');
const { createApp } = await import('../src/app.js');
const { env } = await import('../src/config/env.js');

await connectDB(env.mongoUri);
await seed({ withDemo: true });

createApp().listen(env.port, () => {
  console.log(`Retain API (in-memory DB) listening on http://localhost:${env.port}`);
});

const shutdown = async () => {
  await mongo.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
