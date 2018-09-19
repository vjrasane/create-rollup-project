/* @flow */

import deepmerge from 'deepmerge'

import type { Config } from '../types'

export default (conf: Config): Config => {
  const devDependencies: Array<string> = ['lint-staged']

  const lintStaged = {}

  if (conf.features.eslint) {
    lintStaged['*.js'] = ['eslint --fix', 'git add']
  }
  if (conf.features['format-package']) {
    lintStaged['package.json'] = ['format-package -w', 'git add']
  }

  return deepmerge(conf, {
    package: {
      devDependencies,
      'lint-staged': lintStaged
    }
  })
}
