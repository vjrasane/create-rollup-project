/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

import type { Config } from '../types'

export default (conf: Config): Config => {
  const devDependencies: Array<string> = ['jest', 'cross-env']

  const scripts: { test: string } = {
    test:
      (conf.features.standard ? 'standard && ' : '') +
      'cross-env NODE_ENV=development jest --coverage'
  }

  template('jest.config.js.template', conf)

  conf.features.babel && template('.babelrc.template', conf)

  return deepmerge(conf, {
    package: {
      scripts,
      devDependencies
    }
  })
}
