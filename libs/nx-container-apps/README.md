# @dympydev/nx-container-apps

Using these generators/executors you can easily add a container application to your NX monorepo.
The container applications are based on docker-compose files, by default you can choose one of the templates to get started.
If you want to go as barebones as possible, I would suggest picking the nginx_example template and go from there.

The currently supported templates are:

| Template name | Description                                                                              | More info                                    |
| ------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| nginx_example | A simple NGINX web-server, serving a single HTML file (also generated)                   | [NGINX Homepage](https://nginx.com)          |
| supabase      | A local Supabase instance, not meant for production, but has everything to get started!  | [Supabase Homepage](https://supabase.com)    |
| pocketbase    | A local Pocketbase instance, not meant for production but has everything to get started! | [Pocketbase Homepage](https://pocketbase.io) |
| directus      | A local Directus instance, not meant for production but has everything to get started!   | [Directus Homepage](https://directus.io)     |

## Generators:

### application

The application-generator allows you to add a container application, based on the chosen template, to your NX-monorepo. It integrates with the rest of the NX-ecosystem by using the start and stop executors also present in this plugin. The generated application will contain 3 commands:
- **serve:** starts the application and keep the console open for container logs.
- **daemon:** starts the application as a daemon (using the `-d`-flag).
- **stop:** executes the `compose stop` command for the application.

While generating the application, you also have access to a number of options, namely:

| Property         | Default       | Description                                                                                                                                                                     |
| ---------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name             |               | The name for this new NX application.                                                                                                                                           |
| template         | nginx_example | The template to use, options are mentioned at the top of this document.                                                                                                         |
| appPort          | 3000          | The port the container application should expose, in case of the out-of-the-box template this is automatically mapped to the default exposed port of the container application. |
| containerTooling | docker        | The container-tooling to use, currently only Docker and Podman are supported. In both cases it is up to the user to set-up either docker-compose or podman-compose.             |
| useDockerV1      | false         | Whether to use the old docker-compose syntax (`docker-compose ...`) or the new V2 variant (`docker compose ...`).                                                               |

## Executors:

### start

The start-executor uses the "nx:run-commands"-executor to run the correct `compose up`-command (based on the provided options) to start the application.

When using the application generator, most of these options will be pre-set based on the chosen template.

| Option           | Required | Description                                                                           |
| ---------------- | -------- | ------------------------------------------------------------------------------------- |
| containerTooling | Yes      | Which container-tooling to use, either "docker" or "podman".                          |
| runAsDaemon      | Yes      | Whether the container application should run in daemon-mode (`docker compose up -d`). |
| useDockerV1      | Yes      | Whether to use the V2 or V1 command-syntax for docker-compose.                        |
| envFile          | No       | The path to an environment file that has to be loaded before executing the command.   |

### stop

The stop-executor uses the "nx:run-commands"-executor to run the `compose stop`-command (based on the provided options) to stop the application. This executor is here because sometimes using the `CTRL+C` (or `CMD+C` on MacOS) does not always stop all containers. For instance, I've seen the Supabase Postgres database and imgproxy containers still running after cancelling the start command.

When using the application generator, most of these options will be pre-set based on the chosen template.

| Option           | Required | Description                                                                         |
| ---------------- | -------- | ----------------------------------------------------------------------------------- |
| containerTooling | Yes      | Which container-tooling to use, either "docker" or "podman".                        |
| useDockerV1      | Yes      | Whether to use the V2 or V1 command-syntax for docker-compose.                      |
| envFile          | No       | The path to an environment file that has to be loaded before executing the command. |

## Known limitations:

Sadly, there are a few things that are not quite going the way I would like them to go. I will document these limitations here, but also as issues on the GitHub-issues tab so we have a place to track progress!

The current known limitations are:

- **Cancelling the start command doesn't stop all containers:** As mentioned in the stop-executor documentation, some containers seem to persist when cancelling the start-executor. The stop-executor is here not only for the daemon configuration, but also to stop all containers if simply cancelling the start-executor wasn't enough. I hope to be able to fix this in the future.
- **More templates!** Right now I've only added templates for stuff I use on a (mostly) daily basis, I am however always willing to add more to the mix! So if you want support for another container application, create a feature request for this repo (or add it in a PR!).
