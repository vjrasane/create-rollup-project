/* @flow */

import cliArgs from 'command-line-args'
import { readFileSync } from 'fs'
import { yellow, red } from 'chalk'
import { stdout, error, success } from './logging'
import { join, dirname } from 'path'
import config from './config'
import usage from './usage'

import type { Arguments } from './types'

const readLogo = (line: string): string => {
  const path: string = join(
    dirname(dirname(module.filename)),
    'resources/logo',
    line + '.txt'
  )
  const contents: string = readFileSync(path, 'utf-8')
  return contents
}

;(async (): Promise<void> => {
  try {
    stdout(yellow(readLogo('create')))
    stdout(red(readLogo('rollup')))
    stdout(yellow(readLogo('project')))

    const args: Arguments = cliArgs([
      {
        name: 'dir',
        alias: 'd',
        defaultOption: true
      },
      {
        name: 'help',
        alias: 'h',
        type: Boolean
      },
      {
        name: 'dry-run',
        type: Boolean
      },
      {
        name: 'defaults',
        type: Boolean
      }
    ])

    if (args.help) {
      stdout(usage)
      process.exit()
    }

    if (!args.dir) throw new Error('Target directory not specified')
    await config(args)
    success('Configuration finished succesfully!')
  } catch (err) {
    stdout(usage)
    error(err.message)
    process.exit(1)
  }
})()
