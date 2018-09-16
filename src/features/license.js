/* @flow */

import { staticFile, template } from '../template'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

export default (opts: Object): Object => {
  const license = opts.package.license

  const findLicense = (dir: string, handler: Function<void>): void => {
    const resPath = join('licenses', license)
    const absPath = join(dirname(dirname(module.filename)), 'resources', dir, resPath)
    if (existsSync(absPath)) {
      handler(resPath, opts, 'LICENSE')
    }
  }

  findLicense('static', staticFile)
  findLicense('templates', template)

  opts.licenseEnc = opts.package.license.replace(/-/g, '%20')
  return opts
}
