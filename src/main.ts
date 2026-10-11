import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`TechClues API listening on port ${port}`);
}
bootstrap();
