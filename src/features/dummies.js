/* @flow */

import { template } from '../template'

import type { Options } from '../types'

export default (opts: Options): Options => {
  template('main.js.template', opts, 'src/main.js')
  opts.features.jest && template('main.test.js.template', opts, 'test/main.test.js')
  return opts
}
