import { spawn } from 'child_process';
import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { default as runCommands } from 'nx/src/executors/run-commands/run-commands.impl';

export async function runCommandInProject(
  command: string,
  context: ExecutorContext,
  envFile?: string | undefined
): Promise<{ success: boolean }> {
  const projectConfiguration = context.projectsConfigurations;
  const currentProject = context.projectName;
  if (!projectConfiguration || !currentProject) {
    console.error('Something is wrong with the NX configuration');
    return {
      success: false,
    };
  }

  const projectDir = projectConfiguration.projects[currentProject].root;
  const cwd = joinPathFragments(`${context.root}/${projectDir}`);

  console.log(`Running "${command}" in "${cwd}"`);

  return await runCommands(
    {
      command,
      cwd,
      parallel: false,
      color: true,
      __unparsed__: [],
      envFile,
    },
    context
  );
}

export function checkCommand(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const isWindows: boolean = process.platform === 'win32';
    const cmd = spawn(isWindows ? 'where' : 'which', [command]);

    cmd.on('error', function () {
      resolve(false);
    });

    cmd.on('exit', function (code: number) {
      resolve(code === 0);
    });
  });
}
