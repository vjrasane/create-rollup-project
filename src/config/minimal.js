/* @flow */

import type { Options } from '../types'

export default (defaultOpts: Options): Options => {
  const opts = { ...defaultOpts }
  delete opts.package.license
  delete opts.package.repository
  opts.featureList = ['rollup', 'babel', 'jest', 'dummies']
  return opts
}
