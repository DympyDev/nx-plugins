import { CheckExecutorSchema } from './schema';
import executor from './executor';

const options: CheckExecutorSchema = {};

describe('Check Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
