/* @flow */

import { template } from '../template'

export default (opts: Object): Object => {
  template('main.js.template', opts, 'src/main.js')
  opts.features.jest && template('main.test.js.template', opts, 'test/main.test.js')
  return opts
}
