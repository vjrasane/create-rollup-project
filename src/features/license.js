/* @flow */

import { template } from '../template'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

import type { Config } from '../types'

export default (conf: Config): Config => {
  const license: string = conf.package.license

  conf.licenseEnc = conf.package.license.replace(/-/g, '%20')

  const resPath: string = join('licenses', license)
  const absPath: string = join(dirname(dirname(module.filename)), 'resources/templates', resPath)
  if (existsSync(absPath)) {
    template(resPath, conf, 'LICENSE')
  }

  return conf
}
