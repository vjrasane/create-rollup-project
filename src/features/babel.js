/* @flow */

import deepmerge from 'deepmerge'

import type { Options } from '../types'

export default (opts: Options): Options => {
  const devDependencies: Array<string> = [
    'babel-core',
    'babel-preset-env',
    'babel-plugin-external-helpers',
    'babel-plugin-transform-class-properties',
    'babel-plugin-transform-object-rest-spread',
    'babel-plugin-transform-runtime'
  ]

  opts.features.eslint && devDependencies.push('babel-eslint')
  opts.features.flow && devDependencies.push('babel-preset-flow')

  return deepmerge(opts, {
    package: {
      devDependencies
    }
  })
}
