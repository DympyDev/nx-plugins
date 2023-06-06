export interface BuildExecutorSchema {
    distPath: string;
    envFile?: string;
    copyPackageJson?: boolean;
    packageJsonExclusions?: string[];
}
