/* @flow */

import deepmerge from 'deepmerge'

import type { Config } from '../types'

export default (opts: Config): Config => {
  const optionalDependencies: Array<string> = ['husky']

  let precommit
  if (opts.features['lint-staged']) {
    precommit = 'lint-staged'
  } else if (opts.standard) {
    precommit = 'standard'
  } else if (opts.features.eslint) {
    precommit = 'yarn lint'
  } else {
    precommit = 'yarn test'
  }

  const scripts: { test: string } = {
    precommit,
    prepush: 'yarn test'
  }

  return deepmerge(opts, {
    package: {
      scripts,
      optionalDependencies
    }
  })
}
