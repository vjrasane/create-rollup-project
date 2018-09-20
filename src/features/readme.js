/* @flow */

import deepmerge from 'deepmerge'
import { template } from '../template'

import type { Config } from '../types'

export default (conf: Config): Config => {
  const readme = {}

  if (conf.features.license && conf.license) {
    readme.license = {
      badge: '[![License][License badge]][License]',
      badgeLink:
        '[License badge]: https://img.shields.io/badge/License-' +
        conf.license.enc +
        '-blue.svg',
      projectLink:
        '[License]: https://opensource.org/licenses/' + conf.package.license
    }
  }

  if (conf.features.travis && conf.github) {
    const projectLink = 'https://travis-ci.org/' + conf.github.link
    readme.travis = {
      badge: '[![Build Status][travis badge]][travis]',
      badgeLink:
        '[Travis badge]: ' + projectLink + '.svg?branch=master&service=github',
      projectLink: '[Travis]: ' + projectLink
    }
  }

  if (conf.features.coveralls && conf.github) {
    readme.coveralls = {
      badge: '[![Coverage Status][coverage badge]][coveralls] ',
      badgeLink:
        '[Coverage badge]: https://coveralls.io/repos/github/' +
        conf.github.link +
        '/badge.svg?service=github',
      projectLink:
        '[Coveralls]: https://coveralls.io/github/' + conf.github.link
    }
  }

  if (conf.features.publish) {
    const projectLink = 'https://badge.fury.io/js/' + conf.package.name
    readme.publish = {
      badge: '[![npm version][npm badge]][npm]',
      badgeLink: '[npm badge]: ' + projectLink + '.svg?service=github',
      projectLink: '[npm]: ' + projectLink
    }
  }

  const processed = deepmerge(conf, { readme })

  template('README.md.template', processed)

  return processed
}
