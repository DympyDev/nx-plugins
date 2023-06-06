# @dympydev/nx-sveltekit

Using these generators/executors you can easily add a Svelte-kit application to your NX monorepo.
Based on the create-svelte package, you can choose between a number of different templates, as well als adapters.

## Generators:

### application

The application-generator allows you to add SvelteKit application, based on the provided tempalte, to your NX-monorepo. During the setup you can also pick which adapter it should use (though the default options are somehwat limited).

| Property | Default  | Description                                                                                    |
| -------- | -------- | ---------------------------------------------------------------------------------------------- |
| name     |          | The name for this new NX application.                                                          |
| template | skeleton | The template to use (adopted from the create-svelte package), options are "skeleton" or "demo" |
| adapter  | auto     | The adapter to use, options are "auto", "node" and "static"                                    |

### route

The route-generator allows you to add a route to your application using a `+page.svelte` file, along with any data-loading code if required. When adding a route with arguments, please wrap the route in double-quotes as the brackets aren't understood by the NX-cli.

| Property   | Default | Description                                                                                             |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------- |
| route      |         | The route you want to add, when including argument (like `[slug]`) it should be surrounded with quotes. |
| project    |         | The project we should add the route to. Generator fails if there is no `svelte.config.js`-file present. |
| loadData   | false   | Whether or not data-loading should occur (generates a `+page.ts`-file)                                  |
| serverSide | false   | Whether or not data-loading should occur server-side (generates a `+page.server.ts`-file)               |

### layout

The layout-generator adds a `+layout.svelte` file with a default slot at the path you've provided, along with any data-loading code if required. When adding a layout to a route with arguments, please wrap the route in double-quotes as the brackets aren't understood by the NX-cli.

| Property   | Default | Description                                                                                                                    |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| route      |         | The route where you want to add the layout, when route includes arguments (like `[slug]`) it should be surrounded with quotes. |
| project    |         | The project we should add the layout to. Generator fails if there is no `svelte.config.js`-file present.                       |
| loadData   | false   | Whether or not data-loading should occur (generates a `+layout.ts`-file)                                                       |
| serverSide | false   | Whether or not data-loading should occur server-side (generates a `+layout.server.ts`-file)                                    |

## Executors:

### build

The build-executor uses the "nx:run-commands"-executor to run the `vite build`-command to build the application. After a build, it copies over the output to the provided "distPath"-option (which, when using the application-generator, defaults to the dist folder in the root of the monorepo).

| Option                | Required | Description                                                                                                  |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| distPath              | Yes      | The distPath where all generated output should be copied to.                                                 |
| envFile               | No       | Location of an optional env-file that should be used while building.                                         |
| copyPackageJson       | No       | Whether or not the root-package.json should be copied over the distPath.                                     |
| packageJsonExclusions | No       | A list of (dev) dependency packages you don't need or want in your SvelteKit-package.json (such as "@nx/\*") |

### serve

The serve-executor uses the "nx:run-commands"-executor to run the `vite dev`-command to serve the application.

| Option  | Required | Description                                                          |
| ------- | -------- | -------------------------------------------------------------------- |
| envFile | No       | Location of an optional env-file that should be used while building. |

### preview

The preview-executor uses the "nx:run-commands"-executor to run the `vite preview`-command to preview the previously build application. This executor depends on the build target, something that is configured automatically when using the application-generator.

This executor does not have any options (yet).

### test

The test-executor uses the "nx:run-commands"-executor to run the `vitest`-command to run the unit-tests for the application. By default it will just run the tests once and then finish, but there is an option to run it in watch-mode.

| Option | Required | Description                          |
| ------ | -------- | ------------------------------------ |
| watch  | No       | Starts the unit-tests in watch mode. |

### e2e

The e2e-executor uses the "nx:run-commands"-executor to run the `playwright test`-command to run the E2E tests. Before running the tests it will always execute a `npx playwright install`-command, just to make sure everything is in place for the playwright tests.

This executor does not have any options (yet).

### check

The check-executor uses the "nx:run-commands"-executor to run the `svelte-check`-command, as well as the `svelte-kit sync`-command. The sync command will update the generated files (such as the types and whatnot) and the check command will provide different diagnostics for your svelte app (not a replacement for the linter!). By default it will just run these commands once and then finish, but there is an option to run the check-command in watch-mode.

| Option | Required | Description                                      |
| ------ | -------- | ------------------------------------------------ |
| watch  | No       | Starts the `svelte-check`-command in watch mode. |

## A little bit of black magic:

While most of the generated application is straight out off the `create-svelte`-package, I did add a little bit of black magic to make things work nicely with NX. It mainly comes down to:

- Allowing imports from the root of the monorepo, so we can access shared libraries and such.
- Generating SvelteKit aliases based on the tsconfig.base.json from the root of the monorepo.

The first part is rather easy, when generating the application, I take the project-path we're generating (relative to the root of the monorepo) and convert that to a "projectDepth" constant. This constant basically consists of the number of `../` we have to do to reach the root of the monorepo from the application-folder. Then, while generating the vite.config.ts, we add this "projectDepth" to the `server.fs.allow`-property, so the vite dev server is allowed to load files from the complete monorepo and not just the application itself.

The second piece of black magic, is a little more magical than the first. Because SvelteKit uses Vite under the hood, we have access to aliases. SvelteKit uses this out-of-the-box for stuff like `$lib`, but we can extend this to add the `compilerOptions.paths` from our tsconfig.base.json from the root of the monorepo. This way, you can simply import from `@your-repo-scope/your-library` in your .ts/.js/.svelte files (in case of the .svelte files there's a known limitation regarding the dependency-graph, see below). We achieve this by requiring the tsconfig file, grabbing the `compilerOptions.paths` and converting them to aliases with a little help from `Object.entries` and `Array.reduce`.

## Known limitations:

Sadly, there are a few things that are not quite going the way I would like them to go. I will document these limitations here, but also as issues on the GitHub-issues tab so we have a place to track progress!

The current known limitations are:

- **No library generator:** Right now we only support applications, routes and layouts, but the create-svelte package also has a preset for libraries. I want to add this as well, along with options to distinguish between workspace and publishable libraries.
- **`.svelte`-files in the dep-graph:** When you import a workspace-library in a ts or js file inside the SvelteKit application source, it correctly shows up in the dependency-graph. However, when importing one of these libraries in a ".svelte"-file, it is missing. The great folks over at Nrwl have [documented how to extend the dependency-graph](https://nx.dev/plugins/recipes/project-graph-plugins), but I haven't had the time to add it as of now.
- **A nice NX-starting page as application template option:** Both React and Angular get this nice NX getting-started page when you generate a new application. I want to recreate that for the SvelteKit applications, just because it's fun!
