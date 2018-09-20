/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

import type { Config } from '../types'

export default (conf: Config): Config => {
  const scripts = []

  conf.features.coveralls && scripts.push('yarn coveralls')
  conf.features.rollup && scripts.push('yarn build')

  const processed = deepmerge(conf, {
    travis: {
      afterSuccess: {
        scripts
      }
    }
  })

  template('.travis.yml.template', processed)

  return processed
}
