import {
  formatFiles,
  generateFiles,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { existsSync } from 'fs';
import { join as pathJoin } from 'path';
import { RouteGeneratorSchema } from './schema';

export async function routeGenerator(
  tree: Tree,
  options: RouteGeneratorSchema
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
    options.route
  );

  if (
    existsSync(pathJoin(routeProjectPath, '+page.svelte')) ||
    (options.loadData &&
      (existsSync(pathJoin(routeProjectPath, '+page.ts')) ||
        existsSync(pathJoin(routeProjectPath, '+page.server.ts'))))
  ) {
    throw new Error(
      `Route already exists! Please remove the existing route before generating a new one.`
    );
  }

  let scriptContent = '// Do coding magic here!';

  if (options.loadData) {
    scriptContent = `import type { PageData } from './$types';

  export let data: PageData;`;

    if (options.serverSide) {
      generateFiles(
        tree,
        pathJoin(__dirname, 'files', 'page-load-server'),
        routeProjectPath,
        {
          ...options,
        }
      );
    } else {
      generateFiles(
        tree,
        pathJoin(__dirname, 'files', 'page-load'),
        routeProjectPath,
        {
          ...options,
        }
      );
    }
  }

  generateFiles(tree, pathJoin(__dirname, 'files', 'route'), routeProjectPath, {
    ...options,
    scriptContent,
  });
  await formatFiles(tree);
}

export default routeGenerator;
