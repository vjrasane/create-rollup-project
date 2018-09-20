/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

export default (conf: Object): Object => {
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

  conf.features.babel && devDependencies.push('rollup-plugin-babel')

  const scripts: { build: string, watch: string } = {
    build: 'cross-env NODE_ENV=production rollup -c',
    watch: 'cross-env NODE_ENV=development rollcp -c -w'
  }

  const processed = deepmerge(conf, {
    package: {
      main: 'dist/main.js', // change main to the bundle
      scripts,
      devDependencies
    },
    rollup: {
      cli: conf.projectType === 'Command Line Tool'
    }
  })

  template('rollup.config.js.template', conf)

  return processed
}
