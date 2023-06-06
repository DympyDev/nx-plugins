import { E2eExecutorSchema } from './schema';
import executor from './executor';

const options: E2eExecutorSchema = {};

describe('E2e Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
