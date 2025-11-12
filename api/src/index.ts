import { createApp } from './app';
import { createInMemoryMemoRepo } from './repos/memo.repo';
import { createMemoService } from './services/memo.service';

const PORT = process.env.API_PORT || 3000;

const repo = createInMemoryMemoRepo();
const service = createMemoService(repo);
const app = createApp({ repo, service });

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
