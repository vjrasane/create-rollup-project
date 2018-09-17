/* @flow */

export type Package = {
  name: string,
  version: string,
  author: string,
  main?: string,
  scripts?: Object,
  license?: string,
  description?: string,
  dependencyPkgs?: Array<string>,
  repository?: {type: string, url: string},
  projectLink?: string
}

export type Options = {
  tmpDir: string,
  package: Package,
  year: number,
  featureList: Array<string>,
  features?: Object
}

export type Arguments = {
  dir: string,
  help?: boolean,
  'dry-run'?: boolean,
  defaults?: boolean
}
