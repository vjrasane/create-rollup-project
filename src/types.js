/* @flow */

export type Package = {
  name: string,
  version: string,
  author: string,
  main?: string,
  scripts?: Object,
  license: string,
  description?: string,
  devDependencies: Object,
  projectLink?: string,
  repository: { type?: string, url?: string }
}

export type Options = {
  targetDir: string,
  tmpDir: string,
  package: Package,
  year: number,
  featureList: Array<string>,
  features: Object,
  projectType: string,
  licenseEnc?: string,
  dependencyPkgs: Array<string>
}

export type Arguments = {
  dir: string,
  help?: boolean,
  'dry-run'?: boolean,
  config?: string
}
