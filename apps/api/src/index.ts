import { createApp } from './server.ts';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const server = createApp();
server.listen(port, () => {
  console.log(`Tickets API listening on http://localhost:${port}`);
});
