/* @flow */

import deepmerge from 'deepmerge'
import { grey } from 'chalk'
import rollup from './rollup'
import babel from './babel'
import jest from './jest'
import eslint from './eslint'
import standard from './standard'
import dummies from './dummies'
import license from './license'
import github from './github'
import lintStaged from './lint-staged'
import { template } from '../template'
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

const chain = (
  funcs: Array<(conf: Config) => Config>
): ((conf: Config) => Config) => (conf: Config): Config => {
  const res = funcs.reduce((acc, curr) => curr(acc), conf)
  return res
}

const features = [
  // bundling
  ['rollup', rollup],
  ['babel', babel],
  // style
  ['eslint', eslint],
  ['standard', standard],
  [
    'flow',
    chain([deps(['flow-bin', 'flow-typed']), temp('.flowconfig.template')])
  ],
  ['lint-staged', lintStaged],
  [
    'format-package',
    chain([deps(['format-package']), script('format:pkg', 'format-package -w')])
  ],
  // testing
  ['jest', jest],
  [
    'husky',
    chain([
      deps(['husky'], 'optionalDependencies'),
      temp('husky.config.js.template')
    ])
  ],
  ['travis', temp('.travis.yml.template')],
  [
    'coveralls',
    chain([
      deps(['coveralls']),
      script('coveralls', 'cat ./coverage/lcov.info | coveralls')
    ])
  ],
  // misc
  ['dummies', dummies],
  ['github', github], // github before readme
  ['license', license], // license before readme
  ['publish', temp('.yarnignore.template')], // publish before readme
  ['readme', temp('README.md.template')]
]

export default (conf: Config): Config =>
  features.reduce((acc, /* array destructuring */ [feat, func]) => {
    if (feat in conf.features) {
      stdout(' * ' + feat)
      return func(acc)
    }
    stdout(grey(' * ' + feat + ' (skipped)'))
    return acc
  }, conf)
