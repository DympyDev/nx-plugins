import { ExecutorContext } from '@nx/devkit';
import { StartExecutorSchema } from './schema';
import { runCommandInProject } from '@dympydev/nx-plugin-utils';

export default async function runExecutor(
  options: StartExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for start', options);

  const cmdArr = [
    [options.containerTooling, 'compose'].join(options.useDockerV1 ? '-' : ' '),
    'up',
  ];

  if (options.runAsDaemon) {
    cmdArr.push('-d');
  } else {
    cmdArr.push('--abort-on-container-exit');
  }

  if (options.envFile) {
    return await runCommandInProject(
      cmdArr.join(' '),
      context,
      options.envFile
    );
  }
  return await runCommandInProject(cmdArr.join(' '), context);
}
