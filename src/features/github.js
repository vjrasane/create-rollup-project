/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

import type { Config } from '../types'

export default (conf: Config): Config => {
  const link: string = conf.package.repository
    .split('/') // split the URI to path parts
    .splice(-2) // take two last parts
    .join('/') // combine them back to a string

  template('.gitignore.template', conf)

  return deepmerge(conf, {
    package: {
      repository: {
        type: 'git',
        url: conf.package.repository
      },
      bugs: {
        url: conf.package.repository + '/issues'
      },
      homepage: conf.package.repository + '#readme'
    },
    github: {
      link
    }
  })
}
