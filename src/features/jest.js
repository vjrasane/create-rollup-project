/* @flow */

import deepmerge from 'deepmerge'
import { staticFile, template } from '../template'

import type { Options } from '../types'

export default (opts: Options): Options => {
  const dependencyPkgs: Array<string> = ['jest', 'cross-env']

  const scripts: { test: string } = {
    test:
      (opts.features.standard ? 'standard && ' : '') +
      'cross-env NODE_ENV=development jest --coverage'
  }

  staticFile('jest.config.js', opts)

  opts.features.babel && template('.babelrc.template', opts)

  return deepmerge(opts, {
    dependencyPkgs,
    package: {
      scripts
    }
  })
}
