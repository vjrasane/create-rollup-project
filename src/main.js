/* @flow */

import cliArgs from 'command-line-args'
import { readFileSync } from 'fs'
import { yellow, red } from 'chalk'
import { stdout, error } from './logging'
import { join, dirname } from 'path'
import config from './config'

const readLogo = line => {
  const path = join(
    dirname(dirname(module.filename)),
    'resources/logo',
    line + '.txt'
  )
  const contents = readFileSync(path, 'utf-8')
  return contents
}
;(async () => {
  try {
    stdout(yellow(readLogo('create')))
    stdout(red(readLogo('rollup')))
    stdout(yellow(readLogo('project')))

    const args: Object = cliArgs({
      name: 'dir',
      alias: 'd',
      defaultOption: true
    })

    const processDir = process.cwd()
    if (!args.dir) throw new Error('Target directory not specified')

    const dirPath = join(processDir, args.dir)

    await config(dirPath)
  } catch (err) {
    error(err.message)
    process.exit(1)
  }
})()
