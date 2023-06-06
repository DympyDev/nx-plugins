import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { default as runCommands } from 'nx/src/executors/run-commands/run-commands.impl';
import { CheckExecutorSchema } from './schema';

export default async function runExecutor(
  options: CheckExecutorSchema,
  context: ExecutorContext
) {
  const projectDir = context.workspace.projects[context.projectName].root;
  const projectRoot = joinPathFragments(`${context.root}/${projectDir}`);

  let checkCmd = 'svelte-kit sync && svelte-check --tsconfig ./tsconfig.json';

  if (options.watch) {
    checkCmd += ' --watch'
  }

  const { success } = await runCommands(
    {
      command: checkCmd,
      cwd: projectRoot,
      parallel: false,
      color: true,
      __unparsed__: [],
    },
    context
  );

  return { success };
}
