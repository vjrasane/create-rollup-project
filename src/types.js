/* @flow */

export type Package = {
  name: string,
  version: string,
  author: string,
  main?: string,
  scripts?: Object,
  license?: string,
  repository?: { type: string, url: string },
  devDependencies: Array<string> | Object,
  optionalDependencies: Array<string> | Object,
  dependencies: Array<string> | Object
}

export type Config = {
  targetDir: string,
  tmpDir: string,
  package: Package,
  year: number,
  features: Array<string> | Object,
  projectType: string,
  projectLink?: string,
  licenseEnc?: string
}

export type Arguments = {
  dir: string,
  help?: boolean,
  'dry-run'?: boolean,
  config?: string
}
