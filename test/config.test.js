/* @flow */

import config from '../src/config'
import { removeSync } from 'fs-extra'
import { dirname, join } from 'path'

const testDir = dirname(module.filename)
const targetDir = join(testDir, 'test-target-dir')

describe('test config', (): void => {
  afterEach(() => {
    removeSync(targetDir)
  })

  it('defaults', async () => {
    await config({
      dir: targetDir,
      config: 'defaults'
    })
  })
})
