/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */
import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';

import devkit from '@nx/devkit';
import { join } from 'path';
const { readCachedProjectGraph } = devkit;

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message));
    process.exit(1);
  }
}

// Executing publish script: node path/to/publish.mjs {name} --version {version} --tag {tag}
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
const [, , name, version, tag = 'next'] = process.argv;

// A simple SemVer validation to validate the version
const validVersion = /^\d+\.\d+\.\d+(-\w+\.\d+)?/;
invariant(
  version && validVersion.test(version),
  `No version provided or version did not match Semantic Versioning, expected: #.#.#-tag.# or #.#.#, got ${version}.`
);

const graph = readCachedProjectGraph();
const project = graph.nodes[name];

invariant(
  project,
  `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`
);

const srcPackageJson = join(project.data?.sourceRoot,'..', 'package.json');
invariant(
  srcPackageJson,
  `Could not find "sourceRoot" of project "${name}". Is project.json configured correctly?`
);

// Updating the version in "package.json" before publishing
try {
  const json = JSON.parse(readFileSync(srcPackageJson).toString());
  json.version = version;
  writeFileSync(srcPackageJson, JSON.stringify(json, null, 2));
} catch (e) {
  console.error(
    chalk.bold.red(`Error reading package.json file from library src.`)
  );
  process.exit(1);
}