/* @flow */

import deepmerge from 'deepmerge'

export default (opts: Object): Object => {
  const dependencyPkgs: Array<string> = [
    'babel-core',
    'babel-plugin-external-helpers',
    'babel-plugin-transform-class-properties',
    'babel-plugin-transform-object-rest-spread',
    'babel-plugin-transform-runtime'
  ]

  opts.features.eslint && dependencyPkgs.push('babel-eslint')
  opts.features.flow && dependencyPkgs.push('babel-preset-flow')

  return deepmerge(opts, {
    package: {
      dependencyPkgs
    }
  })
}
