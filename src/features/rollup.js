/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

export default (opts: Object): Object => {
  const devDependencies: Array<string> = [
    'rollup',
    'rollup-plugin-commonjs',
    'rollup-plugin-filesize',
    'rollup-plugin-node-resolve',
    'rollup-plugin-progress',
    'rollup-plugin-json',
    'rollup-plugin-uglify',
    'rollup-plugin-node-builtins',
    'cross-env'
  ]

  opts.features.babel && devDependencies.push('rollup-plugin-babel')

  const scripts: { build: string, watch: string } = {
    build: 'cross-env NODE_ENV=production rollup -c',
    watch: 'cross-env NODE_ENV=development rollcp -c -w'
  }

  template('rollup.config.js.template', opts)

  return deepmerge(opts, {
    package: {
      main: 'dist/main.js', // change main to the bundle
      scripts,
      devDependencies
    }
  })
}
