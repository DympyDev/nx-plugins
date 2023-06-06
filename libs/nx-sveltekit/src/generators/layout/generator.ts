import {
  formatFiles,
  generateFiles,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join as pathJoin } from 'path';
import { existsSync } from 'fs';
import { LayoutGeneratorSchema } from './schema';

export async function layoutGenerator(
  tree: Tree,
  options: LayoutGeneratorSchema
) {
  const projectConfig = readProjectConfiguration(tree, options.project);

  if (
    projectConfig.projectType !== 'application' ||
    !existsSync(pathJoin(projectConfig.root, 'svelte.config.js'))
  ) {
    throw new Error('Selected project is not a SvelteKit application');
  }

  const routeProjectPath = pathJoin(
    projectConfig.sourceRoot,
    'routes',
    options.route || ''
  );

  if (
    existsSync(pathJoin(routeProjectPath, '+layout.svelte')) ||
    (options.loadData &&
      (existsSync(pathJoin(routeProjectPath, '+layout.ts')) ||
        existsSync(pathJoin(routeProjectPath, '+layout.server.ts'))))
  ) {
    throw new Error(
      `Layout already exists! Please remove the existing layout before generating a new one.`
    );
  }

  let scriptContent = '// Do coding magic here!';

  if (options.loadData) {
    scriptContent = `import type { LayoutData } from './$types';

  export let data: LayoutData;`;

    if (options.serverSide) {
      generateFiles(
        tree,
        pathJoin(__dirname, 'files', 'layout-load-server'),
        routeProjectPath,
        {
          ...options,
        }
      );
    } else {
      generateFiles(
        tree,
        pathJoin(__dirname, 'files', 'layout-load'),
        routeProjectPath,
        {
          ...options,
        }
      );
    }
  }

  generateFiles(
    tree,
    pathJoin(__dirname, 'files', 'layout'),
    routeProjectPath,
    {
      ...options,
      scriptContent,
    }
  );
  await formatFiles(tree);
}

export default layoutGenerator;
