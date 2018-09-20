import { readFileSync, writeFileSync } from 'fs'
import { mkdirpSync } from 'fs-extra'
import { join, dirname } from 'path'
import { compile, registerHelper } from 'handlebars'
// import Mustache from 'mustache'
import type { Config } from './types'

registerHelper({
  // 'arguments' is only available in anonymous functions, not in arrow functions
  or: function () {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean)
  },
  and: function () {
    return Array.prototype.slice.call(arguments, 0, -1).every(Boolean)
  },
  eq: function (first, second) {
    return first === second
  }
})

const read = (name: string, dir: string): string => {
  const templatePath: string = join(
    dirname(dirname(module.filename)),
    dir || 'resources/templates',
    name
  )
  const contents = readFileSync(templatePath, 'utf-8')
  return contents
}

export const write = (contents: string, target: string) => {
  mkdirpSync(dirname(target)) // create dirs if they dont exist
  writeFileSync(target, contents)
}

export const template = (
  name: string,
  conf: Config,
  target: string
): string => {
  const contents = compile(read(name), { noEscape: true })(conf)
  const targetPath = join(
    conf.tmpDir,
    target ||
      name
        .split('.')
        .slice(0, -1)
        .join('.')
  )
  write(contents, targetPath)
}
