/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

import type { Options } from '../types'

export default (opts: Options): Options => {
  const devDependencies: Array<string> = [
    'eslint',
    'eslint-config-standard',
    'eslint-plugin-import',
    'eslint-plugin-node',
    'eslint-plugin-promise'
  ]

  opts.features.standard && devDependencies.push('eslint-plugin-standard')
  opts.features.flow && devDependencies.push('eslint-plugin-flowtype')

  const scripts: { lint: string } = {
    lint: 'node_modules/.bin/eslint .'
  }

  template('.eslintrc.js.template', opts)
  template('.eslintignore.template', opts)

  return deepmerge(opts, {
    devDependencies,
    package: {
      scripts
    }
  })
}
