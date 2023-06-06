export interface ApplicationGeneratorSchema {
  name: string;
  adapter: 'auto' | 'node' | 'static',
  template: 'demo' | 'skeleton';
}
