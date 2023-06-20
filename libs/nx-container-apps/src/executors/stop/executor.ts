import { runCommandInProject } from '@dympydev/nx-plugin-utils';
import { StopExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';

export default async function runExecutor(
  options: StopExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for Stop', options);

  const cmd = `${[options.containerTooling, 'compose'].join(
    options.useDockerV1 ? '-' : ' '
  )} stop`;

  if (options.envFile) {
    return await runCommandInProject(cmd, context, options.envFile);
  }
  return await runCommandInProject(cmd, context);
}
