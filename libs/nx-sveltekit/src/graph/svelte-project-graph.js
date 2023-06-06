// @ts-check
const { ProjectGraphBuilder } = require('@nrwl/devkit');
const { readdirSync, statSync, readFileSync } = require('fs');
const { join, extname } = require('path');

/**
 * Nx Project Graph plugin for go
 *
 * @param {import('@nrwl/devkit').ProjectGraph} graph
 * @param {import('@nrwl/devkit').ProjectGraphProcessorContext} context
 * @returns {import('@nrwl/devkit').ProjectGraph}
 */
exports.processProjectGraph = (graph, context) => {
  const appsDir = context.nxJsonConfiguration.workspaceLayout?.appsDir;

  const builder = new ProjectGraphBuilder(graph);

  const workspaceLibraries = Object.entries(
    context.projectsConfigurations.projects
  )
    .filter(([project, config]) => config.projectType === 'library')
    .map(([project, config]) => {
      return config.name;
    });
  // TODO: List above to TS-imports, not sure how yet

  const fileTypes = ['svelte']; // file extensions to check

  const moduleStatus = checkFilesInDir(appsDir, fileTypes, workspaceLibraries);

  console.log(moduleStatus);
  // TODO: Check every svelte file (ts and js are already being handled properly), and see if they use any imports from the NX workspace

  return builder.getUpdatedProjectGraph();
};

function checkFilesInDir(directory, fileTypes, moduleNames) {
  const moduleStatus = moduleNames.reduce(
    (acc, moduleName) => ({ ...acc, [moduleName]: false }),
    {}
  );

  const files = readdirSync(directory);

  for (const file of files) {
    const fullPath = join(directory, file);
    const fileStat = statSync(fullPath);

    if (fileStat.isDirectory()) {
      const subdirStatus = checkFilesInDir(fullPath, fileTypes, moduleNames);
      for (const moduleName in moduleStatus) {
        moduleStatus[moduleName] =
          moduleStatus[moduleName] || subdirStatus[moduleName];
      }
    } else if (fileStat.isFile()) {
      const extension = extname(file).slice(1);
      if (fileTypes.includes(extension)) {
        const fileContent = readFileSync(fullPath, 'utf-8');
        for (const moduleName of moduleNames) {
          const regex = new RegExp(`from ['"]${moduleName}['"]`, 'g');
          if (regex.test(fileContent)) {
            moduleStatus[moduleName] = true;
          }
        }
      }
    }
  }

  return moduleStatus;
}
