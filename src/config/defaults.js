/* @flow */

import deepmerge from 'deepmerge'
import { sync } from 'parse-git-config'

import type { Options } from '../types'
import type { Config } from 'parse-git-config'

const GIT_ORIGIN = 'remote "origin"'

const readGitConf = (dirPath: string): Config =>
  sync({ cwd: dirPath, path: '.git/config' })

export const isGitRepo = (opts: Options): boolean =>
  GIT_ORIGIN in readGitConf(opts.targetDir)

export const getGitUrl = (opts: Options): string => {
  if (!isGitRepo(opts)) {
    return [
      'git+https://github.com',
      opts.package.author,
      opts.package.name + '.git'
    ].join('/')
  }

  const gitConf: Config = readGitConf(opts.targetDir)
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

export default (defaultOpts: Options): Options => deepmerge(defaultOpts, {
  package: {
    repository: {
      type: 'git',
      url: getGitUrl(defaultOpts)
    }
  }
})
