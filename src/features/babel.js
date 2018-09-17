/* @flow */

import deepmerge from 'deepmerge'

import type { Options } from '../types'

export default (opts: Options): Options => {
  const dependencyPkgs: Array<string> = [
    'babel-core',
    'babel-preset-env',
    'babel-plugin-external-helpers',
    'babel-plugin-transform-class-properties',
    'babel-plugin-transform-object-rest-spread',
    'babel-plugin-transform-runtime'
  ]

  opts.features.eslint && dependencyPkgs.push('babel-eslint')
  opts.features.flow && dependencyPkgs.push('babel-preset-flow')

  return deepmerge(opts, { dependencyPkgs })
}
