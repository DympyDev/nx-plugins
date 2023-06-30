export interface ComposeFileGeneratorSchema {
  name: string;
  template:
    | 'nginx_example'
    | 'pocketbase'
    | 'supabase'
    | 'appwrite'
    | 'directus'
    | 'mongodb'
    | 'postgres';
  appPort: number;
  containerTooling: 'docker' | 'podman';
  useDockerV1: boolean;
}
