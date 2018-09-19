/* @flow */

import deepmerge from 'deepmerge'

import type { Config } from '../types'

export default (conf: Config): Config => {
  const devDependencies: Array<string> = [
    'babel-core',
    'babel-preset-env',
    'babel-plugin-external-helpers',
    'babel-plugin-transform-class-properties',
    'babel-plugin-transform-object-rest-spread',
    'babel-plugin-transform-runtime'
  ]

  conf.features.eslint && devDependencies.push('babel-eslint')
  conf.features.flow && devDependencies.push('babel-preset-flow')

  return deepmerge(conf, {
    package: {
      devDependencies
    }
  })
}
