import { cyan, yellow, red } from 'chalk'

export const stdout = (msg: string) => process.stdout.write(msg + '\n')

export const divider = () => stdout('='.repeat(process.stdout.columns - 1))

export const info = msg => stdout(cyan('INFO ') + msg)
export const warn = msg => stdout(yellow('WARN ') + msg)
export const error = msg => stdout(red('ERROR ') + msg)
