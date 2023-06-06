import { ExecutorContext, joinPathFragments } from '@nx/devkit';
import { join as pathJoin } from 'path';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { default as runCommands } from 'nx/src/executors/run-commands/run-commands.impl';
import { BuildExecutorSchema } from './schema';
import { copyDirectorySync } from '../../utils/fs-helpers';
import {
  filterObjectByExclusions,
  filterUndefinedAndNullValues,
} from '../../utils/object-helpers';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const projectDir = context.workspace.projects[context.projectName].root;
  const projectRoot = joinPathFragments(`${context.root}/${projectDir}`);

  const { success } = await runCommands(
    {
      command: `vite build`,
      cwd: projectRoot,
      parallel: false,
      color: true,
      __unparsed__: [],
      envFile: options.envFile,
    },
    context
  );

  if (success) {
    const DIST_FOLDER = pathJoin(context.root, options.distPath);

    if (existsSync(DIST_FOLDER)) {
      rmSync(DIST_FOLDER, {
        recursive: true,
      });
    }

    mkdirSync(DIST_FOLDER, {
      recursive: true,
    });

    copyDirectorySync(
      pathJoin(
        context.root,
        context.workspace.projects[context.projectName].root,
        '.svelte-kit',
        'output'
      ),
      DIST_FOLDER
    );

    if (options.copyPackageJson) {
      const rootPackageJson = JSON.parse(
        readFileSync(pathJoin(context.root, 'package.json')).toString()
      );
      const projectSpecificPackageJson = filterUndefinedAndNullValues({
        name: context.projectName,
        version: rootPackageJson.version,
        license: rootPackageJson.license,
        private: rootPackageJson.private,
        dependencies: filterObjectByExclusions(
          rootPackageJson.dependencies,
          options.packageJsonExclusions
        ),
        devDependencies: filterObjectByExclusions(
          rootPackageJson.devDependencies,
          options.packageJsonExclusions
        ),
        type: 'module',
      });

      writeFileSync(
        pathJoin(DIST_FOLDER, 'package.json'),
        JSON.stringify(projectSpecificPackageJson, null, 2)
      );
    }
  }
  return {
    success,
  };
}
