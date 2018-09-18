/* @flow */

import deepmerge from 'deepmerge'
import { sync } from 'parse-git-config'

import type { Config as Conf } from '../types'
import type { Config } from 'parse-git-config'

const GIT_ORIGIN = 'remote "origin"'

const readGitConf = (dirPath: string): Config =>
  sync({ cwd: dirPath, path: '.git/config' })

export const isGitRepo = (conf: Conf): boolean =>
  GIT_ORIGIN in readGitConf(conf.targetDir)

export const getGitUrl = (conf: Conf): string => {
  if (!isGitRepo(conf)) {
    return [
      'git+https://github.com',
      conf.package.author,
      conf.package.name + '.git'
    ].join('/')
  }

  const gitConf: Config = readGitConf(conf.targetDir)
  let url: string = gitConf[GIT_ORIGIN].url

  // replace 'git@' with protocol
  if (url.startsWith('git@')) {
    url = url.replace(':', '/').replace('git@', 'https://')
  }

  // make sure starts with 'git+'
  if (!url.startsWith('git+')) {
    url = 'git+' + url
  }

  // make sure ends with '.git'
  if (!url.endsWith('.git')) {
    url = url + '.git'
  }
  return url
}

export default (defaults: Conf, init: Conf): Conf =>
  deepmerge(defaults, {
    package: {
      repository: {
        type: 'git',
        url: getGitUrl(init)
      }
    }
  })
