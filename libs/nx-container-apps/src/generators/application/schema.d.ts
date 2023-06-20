export interface ComposeFileGeneratorSchema {
  name: string;
  template:
    | 'nginx_example'
    | 'pocketbase'
    | 'supabase'
    | 'appwrite'
    | 'directus';
  appPort: number;
  containerTooling: 'docker' | 'podman';
  useDockerV1: boolean;
}
