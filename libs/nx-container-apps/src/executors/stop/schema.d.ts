export interface StopExecutorSchema {
  containerTooling: 'docker' | 'podman';
  useDockerV1: boolean;
  envFile?: srting;
}
