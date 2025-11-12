import { createApp } from './app';
import { createAsyncInMemoryMemoRepo } from './repos/memo.repo';
import { createAsyncMemoService } from './services/memo.service';

const PORT = process.env.API_PORT || 3000;

const service = createAsyncMemoService(createAsyncInMemoryMemoRepo());
const app = createApp({ service });

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
