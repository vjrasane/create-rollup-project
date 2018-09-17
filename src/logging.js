/* @flow */

import { cyan, yellow, red, green } from 'chalk'

export const stdout = (msg: string): void => process.stdout.write(msg + '\n')

export const divider = (): void => stdout('='.repeat(process.stdout.columns - 1))

export const success = (msg: string): void => stdout(green('SUCCESS ') + msg)
export const info = (msg: string): void => stdout(cyan('INFO ') + msg)
export const warn = (msg: string): void => stdout(yellow('WARN ') + msg)
export const error = (msg: string): void => stdout(red('ERROR ') + msg)
