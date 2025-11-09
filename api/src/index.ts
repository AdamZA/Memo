import { createApp } from './app';

const PORT = process.env.API_PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
