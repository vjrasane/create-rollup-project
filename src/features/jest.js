/* @flow */

import deepmerge from 'deepmerge'
import { staticFile, template } from '../template'

export default (opts: Object): Object => {
  const dependencyPkgs: Array<string> = ['jest', 'cross-env']

  const test =
    (opts.features.standard ? 'standard && ' : '') +
    'cross-env NODE_ENV=development jest --coverage'

  const scripts: Object<string> = {
    test
  }

  staticFile('jest.config.js', opts)
  opts.features.babel && template('.babelrc.template', opts)

  return deepmerge(opts, {
    package: {
      dependencyPkgs,
      scripts
    }
  })
}
