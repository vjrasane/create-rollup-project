import { readFileSync, writeFileSync } from 'fs'
import { mkdirpSync } from 'fs-extra'
import { join, dirname } from 'path'
import { compile, registerHelper } from 'handlebars'

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

const writeFile = (contents: string, target: string) => {
  mkdirpSync(dirname(target)) // create dirs if they dont exist
  writeFileSync(target, contents)
}

export const staticFile = (
  name: string,
  opts: Object<string>,
  target: string
) => {
  const contents = read(name, 'resources/static')
  const targetPath = join(opts.tmpDir, target || name)
  writeFile(contents, targetPath)
}

export const template = (
  name: string,
  opts: Object<string>,
  target: string
): string => {
  const contents = compile(read(name), { noEscape: true })(opts)
  const targetPath = join(
    opts.tmpDir,
    target ||
      name
        .split('.')
        .slice(0, -1)
        .join('.')
  )
  writeFile(contents, targetPath)
}
