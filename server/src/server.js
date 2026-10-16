import { assertEnv, env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

async function start() {
  assertEnv();
  await connectDB(env.mongoUri);

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Retain API listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
