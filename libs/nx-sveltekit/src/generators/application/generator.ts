import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  ensurePackage,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  installPackagesTask,
  NX_VERSION,
  Tree,
} from '@nx/devkit';
import { ApplicationGeneratorSchema } from './schema';
import { existsSync } from 'fs';
import { join } from 'path';
import { convertToKebabCase } from '@dympydev/nx-plugin-utils';

const ADAPTER_MAPPING: Record<string, Record<string, string>> = {
  auto: {
    '@sveltejs/adapter-auto': '^2.1.0',
  },
  node: {
    '@sveltejs/adapter-node': '^1.2.4',
  },
  static: {
    '@sveltejs/adapter-static': '^2.0.2',
  },
};

const SHARED_DEV_DEPENDENCIES: Record<string, string> = {
  '@sveltejs/kit': '^1.5.0',
  svelte: '^3.54.0',
  vite: '^4.3.6',
  '@playwright/test': '^1.28.1',
  '@typescript-eslint/eslint-plugin': '^5.45.0',
  '@typescript-eslint/parser': '^5.45.0',
  eslint: '^8.28.0',
  'eslint-config-prettier': '^8.5.0',
  'eslint-plugin-svelte': '^2.26.0',
  prettier: '^2.8.0',
  'prettier-plugin-svelte': '^2.8.1',
  'svelte-check': '^3.0.1',
  tslib: '^2.4.1',
  typescript: '^5.0.0',
  vitest: '^0.25.3',
};

const SKELETON_SVELTEKIT_DEPENDENCIES: Record<string, string> = {};

const SKELETON_SVELTEKIT_DEV_DEPENDENCIES: Record<string, string> = {};

const DEMO_SVELTEKIT_DEPENDENCIES: Record<string, string> = {};

const DEMO_SVELTEKIT_DEV_DEPENDENCIES: Record<string, string> = {
  '@fontsource/fira-mono': '^4.5.10',
  '@neoconfetti/svelte': '^1.0.0',
  '@types/cookie': '^0.5.1',
};

export async function applicationGenerator(
  tree: Tree,
  options: ApplicationGeneratorSchema & { projectDepth: string }
) {
  const { appsDir } = getWorkspaceLayout(tree);
  const projectRoot = `${appsDir}/${options.name}`;

  if (!existsSync('tsconfig.base.jsom')) {
    console.log('Adding "@nx/js" and initializing Typescript configurations');
    await ensurePackage('@nx/js', NX_VERSION);
    const { initGenerator } = await import('@nx/js');

    await initGenerator(tree, {});
  }

  const projectDepth = projectRoot
    .split('/')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map((_) => '..')
    .join('/');
  options.projectDepth = projectDepth;

  addProjectConfiguration(tree, convertToKebabCase(options.name), {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    targets: {
      build: {
        executor: '@dympydev/nx-sveltekit:build',
        dependsOn: ['check'],
        options: {
          distPath: `dist/${projectRoot}`,
          copyPackageJson: options.adapter === 'node',
          packageJsonExclusions: ['@nx/*'],
        },
      },
      serve: {
        executor: '@dympydev/nx-sveltekit:serve',
        dependsOn: ['check'],
      },
      preview: {
        executor: '@dympydev/nx-sveltekit:preview',
        dependsOn: ['build'],
      },
      e2e: {
        executor: '@dympydev/nx-sveltekit:e2e',
      },
      test: {
        executor: '@dympydev/nx-sveltekit:test',
        configurations: {
          watch: {
            watch: true,
          },
        },
      },
      check: {
        executor: '@dympydev/nx-sveltekit:check',
        configurations: {
          watch: {
            watch: true,
          },
        },
      },
      lint: {
        executor: '@nrwl/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [`${projectRoot}/**/*.{js,ts,svelte,spec.ts}`],
        },
      },
    },
  });

  generateFiles(
    tree,
    join(__dirname, 'files', `application_${options.template}`),
    projectRoot,
    {
      ...options,
      kebabName: convertToKebabCase(options.name),
    }
  );

  let installCallback: GeneratorCallback;
  if (options.template === 'demo') {
    installCallback = addDependenciesToPackageJson(
      tree,
      DEMO_SVELTEKIT_DEPENDENCIES,
      {
        ...SHARED_DEV_DEPENDENCIES,
        ...DEMO_SVELTEKIT_DEV_DEPENDENCIES,
        ...ADAPTER_MAPPING[options.adapter],
      }
    );
  } else {
    installCallback = addDependenciesToPackageJson(
      tree,
      SKELETON_SVELTEKIT_DEPENDENCIES,
      {
        ...SHARED_DEV_DEPENDENCIES,
        ...SKELETON_SVELTEKIT_DEV_DEPENDENCIES,
        ...ADAPTER_MAPPING[options.adapter],
      }
    );
  }

  await formatFiles(tree);

  return async () => {
    if (installCallback) {
      await installCallback();
      installPackagesTask(tree);
    }
  };
}

export default applicationGenerator;
