/* @flow */

import type { Config } from '../types'

export default (defaults: Config, init: Config): Config => ({
  ...init,
  features: ['rollup', 'babel', 'jest', 'dummies']
})
