export interface StartExecutorSchema {
  containerTooling: 'docker' | 'podman';
  runAsDaemon: boolean;
  useDockerV1: boolean;
  envFile?: string;
}
