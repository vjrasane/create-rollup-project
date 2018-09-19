/* @flow */

import deepmerge from 'deepmerge'
import { grey } from 'chalk'
import rollup from './rollup'
import babel from './babel'
import jest from './jest'
import husky from './husky'
import eslint from './eslint'
import dummies from './dummies'
import license from './license'
import lintStaged from './lint-staged'
import { template, staticFile } from '../template'
import { stdout } from '../logging'

import type { Config } from '../types'

const dependencies = (
  deps: Array<string>,
  depType: string
): ((conf: Config) => Config) => (conf: Config): Config => {
  return deepmerge(conf, {
    package: {
      [depType || 'devDependencies']: deps
    }
  })
}

const scripts = (scripts: Object): ((conf: Config) => Config) => (
  conf: Config
): Config =>
  deepmerge(conf, {
    package: {
      scripts
    }
  })

const templates = (temps: Array<string>): ((conf: Config) => Config) => (
  conf: Config
): Config => {
  temps.forEach(t => template(t, conf))
  return conf
}

const statics = (statics: Array<string>): ((conf: Config) => Config) => (
  conf: Config
): Config => {
  statics.forEach(s => staticFile(s, conf))
  return conf
}

const chain = (
  funcs: Array<(conf: Config) => Config>
): ((conf: Config) => Config) => (conf: Config): Config => {
  const res = funcs.reduce((acc, curr) => curr(acc), conf)
  return res
}

const features: Object = {
  rollup,
  babel,
  jest,
  eslint,
  dummies,
  license,
  husky,
  flow: chain([
    dependencies(['flow-bin', 'flow-typed']),
    statics(['.flowconfig'])
  ]),
  travis: templates(['.travis.yml.template']),
  publish: statics(['.yarnignore']),
  readme: templates(['README.md.template']),
  coveralls: chain([
    dependencies(['coveralls']),
    scripts({ coveralls: 'cat ./coverage/lcov.info | coveralls' })
  ]),
  standard: dependencies(['standard']),
  github: templates(['.gitignore.template']),
  'lint-staged': lintStaged,
  'format-package': chain([
    dependencies(['format-package']),
    scripts({ 'format:pkg': 'format-package -w' })
  ])
}

export default (conf: Config): Config =>
  Object.keys(features).reduce((acc, curr) => {
    if (curr in conf.features) {
      stdout(' * ' + curr)
      return features[curr](acc)
    }
    stdout(grey(' * ' + curr + ' (skipped)'))
    return acc
  }, conf)
