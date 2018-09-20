/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

import type { Config } from '../types'

export default (conf: Config): Config => {
  const devDependencies: Array<string> = [
    'eslint',
    'eslint-config-standard',
    'eslint-plugin-import',
    'eslint-plugin-node',
    'eslint-plugin-promise'
  ]

  conf.features.standard && devDependencies.push('eslint-plugin-standard')
  conf.features.flow && devDependencies.push('eslint-plugin-flowtype')

  const scripts: { lint: string } = {
    lint: 'node_modules/.bin/eslint .'
  }

  const processed = deepmerge(conf, {
    package: {
      scripts,
      devDependencies
    },
    eslint: {
      babel: conf.features.flow || conf.features.babel
    }
  })

  template('.eslintrc.js.template', processed)
  template('.eslintignore.template', processed)

  return processed
}
