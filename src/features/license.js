/* @flow */

import { staticFile, template } from '../template'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

import type { Config } from '../types'

export default (opts: Config): Config => {
  const license: string = opts.package.license

  const findLicense = (dir: string, handler: (path: string, opts: Config, name: string) => void): void => {
    const resPath: string = join('licenses', license)
    const absPath: string = join(dirname(dirname(module.filename)), 'resources', dir, resPath)
    if (existsSync(absPath)) {
      handler(resPath, opts, 'LICENSE')
    }
  }

  findLicense('static', staticFile)
  findLicense('templates', template)

  opts.licenseEnc = opts.package.license.replace(/-/g, '%20')
  return opts
}
