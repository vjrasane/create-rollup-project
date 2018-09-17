/* @flow */

import deepmerge from 'deepmerge'
import { grey } from 'chalk'
import rollup from './rollup'
import babel from './babel'
import jest from './jest'
import eslint from './eslint'
import dummies from './dummies'
import license from './license'
import { template, staticFile } from '../template'
import { stdout } from '../logging'

const dependencies = (dependencyPkgs: Array<string>): Function<Object> => (
  opts: Object
): Object => {
  return deepmerge(opts, {
    package: {
      dependencyPkgs
    }
  })
}

const scripts = (scripts: Object<string>): Function<Object> => (
  opts: Object
): Object =>
  deepmerge(opts, {
    package: {
      scripts
    }
  })

const templates = (temps: Array<string>): Function<Object> => (
  opts: Object
): void => {
  temps.forEach(t => template(t, opts))
  return opts
}

const statics = (statics: Array<string>): Function<Object> => (
  opts: Object
): void => {
  statics.forEach(s => staticFile(s, opts))
  return opts
}

const chain = (funcs: Array<Function<Object>>): Function<Object> => (
  opts: Object
): Object => {
  const res = funcs.reduce((acc, curr) => curr(acc), opts)
  return res
}

const features = {
  rollup,
  babel,
  jest,
  eslint,
  dummies,
  license,
  flow: chain([
    dependencies(['flow-bin', 'flow-typed']),
    statics(['.flowconfig'])
  ]),
  husky: chain([dependencies(['husky']), statics(['husky.config.js'])]),
  travis: templates(['.travis.yml.template']),
  publish: statics(['.yarnignore']),
  readme: templates(['README.md.template']),
  coveralls: chain([
    dependencies(['coveralls']),
    scripts({ coveralls: 'cat ./coverage/lcov.info | coveralls' })
  ]),
  standard: dependencies(['standard']),
  github: templates(['.gitignore.template'])
}

export default opts =>
  Object.keys(features).reduce((acc, curr) => {
    if (curr in opts.features) {
      stdout(' * ' + curr)
      return features[curr](acc)
    }
    stdout(grey(' * ' + curr + ' (skipped)'))
    return acc
  }, opts)
