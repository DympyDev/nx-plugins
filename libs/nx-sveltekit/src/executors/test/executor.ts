import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { default as runCommands } from 'nx/src/executors/run-commands/run-commands.impl';
import { TestExecutorSchema } from './schema';

export default async function runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext
) {
  const projectDir = context.workspace.projects[context.projectName].root;
  const projectRoot = joinPathFragments(`${context.root}/${projectDir}`);

  const { success } = await runCommands(
    {
      command: options.watch ? `vitest watch` : `vitest run`,
      cwd: projectRoot,
      parallel: false,
      color: true,
      __unparsed__: [],
    },
    context
  );

  return { success };
}
