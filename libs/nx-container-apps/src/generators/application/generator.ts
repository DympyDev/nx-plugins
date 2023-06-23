import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { ComposeFileGeneratorSchema } from './schema';
import { convertToKebabCase } from '@dympydev/nx-plugin-utils';

const CONTAINER_ENV_FILES_MAPPING = (projectRoot: string) => ({
  supabase: `${projectRoot}/supabase.env`,
});

export async function composeFileGenerator(
  tree: Tree,
  options: ComposeFileGeneratorSchema
) {
  const { appsDir } = getWorkspaceLayout(tree);
  const projectRoot = `${appsDir}/${options.name}`;

  const containerEnvFile =
    CONTAINER_ENV_FILES_MAPPING(projectRoot)[options.template];

  addProjectConfiguration(tree, convertToKebabCase(options.name), {
    root: projectRoot,
    projectType: 'application',
    targets: {
      serve: {
        executor: '@dympydev/nx-container-apps:start',
        options: {
          containerTooling: options.containerTooling,
          port: options.appPort,
          useDockerV1: options.useDockerV1,
          envFile: containerEnvFile,
        },
      },
      daemon: {
        executor: '@dympydev/nx-container-apps:start',
        options: {
          containerTooling: options.containerTooling,
          port: options.appPort,
          useDockerV1: options.useDockerV1,
          runAsDaemon: true,
          envFile: containerEnvFile,
        },
      },
      stop: {
        executor: '@dympydev/nx-container-apps:stop',
        options: {
          containerTooling: options.containerTooling,
          useDockerV1: options.useDockerV1,
          envFile: containerEnvFile,
        },
      },
    },
  });

  generateFiles(
    tree,
    path.join(__dirname, 'files', options.template),
    projectRoot,
    {
      ...options,
      kebabName: convertToKebabCase(options.name),
    }
  );

  await formatFiles(tree);
}

export default composeFileGenerator;
