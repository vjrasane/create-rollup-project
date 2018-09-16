/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

export default (opts: Object): Object => {
  const dependencyPkgs: Array<string> = [
    'eslint',
    'eslint-config-standard',
    'eslint-plugin-import',
    'eslint-plugin-node',
    'eslint-plugin-promise'
  ]

  opts.features.standard && dependencyPkgs.push('eslint-plugin-standard')
  opts.features.flow && dependencyPkgs.push('eslint-plugin-flowtype')

  const scripts: Object<string> = {
    lint: 'node_modules/.bin/eslint .'
  }

  template('.eslintrc.js.template', opts)
  template('.eslintignore.template', opts)

  return deepmerge(opts, {
    package: {
      dependencyPkgs,
      scripts
    }
  })
}
