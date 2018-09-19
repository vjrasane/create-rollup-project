/* @flow */

import deepmerge from 'deepmerge'
import { grey } from 'chalk'
import rollup from './rollup'
import babel from './babel'
import jest from './jest'
import eslint from './eslint'
import dummies from './dummies'
import license from './license'
import lintStaged from './lint-staged'
import { template, staticFile } from '../template'
import { stdout } from '../logging'

import type { Config } from '../types'

const deps = (
  deps: Array<string>,
  depType: string
): ((conf: Config) => Config) => (conf: Config): Config => {
  return deepmerge(conf, {
    package: {
      [depType || 'devDependencies']: deps
    }
  })
}

const script = (key: string, value: string): ((conf: Config) => Config) => (
  conf: Config
): Config =>
  deepmerge(conf, {
    package: {
      scripts: {
        [key]: value
      }
    }
  })

const temp = (t: string): ((conf: Config) => Config) => (
  conf: Config
): Config => {
  template(t, conf)
  return conf
}

const stat = (s: string): ((conf: Config) => Config) => (
  conf: Config
): Config => {
  staticFile(s, conf)
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
  'lint-staged': lintStaged,
  husky: chain([
    deps(['husky'], 'optionalDependencies'),
    temp('husky.config.js.template')
  ]),
  flow: chain([deps(['flow-bin', 'flow-typed']), stat('.flowconfig')]),
  travis: temp('.travis.yml.template'),
  publish: stat('.yarnignore'),
  readme: temp('README.md.template'),
  coveralls: chain([
    deps(['coveralls']),
    script('coveralls', 'cat ./coverage/lcov.info | coveralls')
  ]),
  standard: deps(['standard']),
  github: temp('.gitignore.template'),
  'format-package': chain([
    deps(['format-package']),
    script('format:pkg', 'format-package -w')
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
