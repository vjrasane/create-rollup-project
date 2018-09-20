/* @flow */

import deepmerge from 'deepmerge'
import type { Config } from '../types'

export default (conf: Config): Config => {
  const env = ['node']

  conf.features.jest && env.push('jest')

  const standard = {
    env
  }

  if (conf.features.flow) {
    standard.ignore = ['flow-typed/**']
    standard.plugins = ['flowtype']
  }

  if (conf.features.babel) {
    standard.parser = 'babel-eslint'
  }

  return deepmerge(conf, {
    package: {
      devDependencies: ['standard'],
      standard
    }
  })
}
