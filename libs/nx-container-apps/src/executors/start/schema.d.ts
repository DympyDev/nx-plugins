export interface StartExecutorSchema {
  port: number;
  containerTooling: 'docker' | 'podman';
  runAsDaemon: boolean;
  useDockerV1: boolean;
  envFile?: string;
}
