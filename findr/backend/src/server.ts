import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`[server] listening on http://0.0.0.0:${env.port}`);
  });
}

main().catch((e) => {
  console.error('[fatal]', e);
  process.exit(1);
});
