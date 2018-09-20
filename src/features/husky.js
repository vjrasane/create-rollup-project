/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

import type { Config } from '../types'

export default (conf: Config): Config => {
  let precommit = 'yarn test'
  if (conf.features['lint-staged']) {
    precommit = 'lint-staged'
  } else if (conf.features.standard) {
    precommit = 'standard'
  } else if (conf.features.eslint) {
    precommit = 'yarn lint'
  }

  const processed = deepmerge(conf, {
    package: {
      optionalDependencies: ['husky']
    },
    husky: {
      precommit
    }
  })

  template('husky.config.js.template', processed)

  return processed
}
