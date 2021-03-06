/* @flow */

import deepmerge from 'deepmerge'
import format from 'format-package'
import { basename, join, isAbsolute } from 'path'
import { existsSync, statSync } from 'fs'
import { userInfo } from 'os'
import { dirSync } from 'tmp'
import { mkdirpSync, removeSync, copySync } from 'fs-extra'
import List from 'prompt-list'
import Confirm from 'prompt-confirm'

import { info, warn, divider } from '../logging'
import { write } from '../template'
import execFeats from '../features'
import pkgJson from '../../package'

import defaults, { isGitRepo } from './defaults'
import minimal from './minimal'
import prompts, { allFeatures } from './prompts'

import type { SynchronousResult } from 'tmp'
import type { Arguments, Config } from '../types'

const choiceMapping = {
  'Use defaults': 'defaults',
  'Minimal configuration': 'minimal',
  'Answer questions': 'prompt'
}

const configChoices = (): Promise<string> =>
  new List({
    message: 'How would you like to configure the project?',
    default: 'Use defaults',
    choices: ['Use defaults', 'Minimal configuration', 'Answer questions']
  })
    .run()
    .then(choice => choiceMapping[choice])

const confirmOverwrite = (): Promise<boolean> =>
  new Confirm({
    message: 'Are you sure you want to configure an existing directory?',
    default: false
  }).run()

const preFeatureProcess = (conf: Config): Config => {
  const features = {}
  conf.features.forEach(f => {
    features[f] = true
  })
  return { ...conf, features }
}

const findDep = (dep: string) => {
  const deps = ['dependencies', 'devDependencies', 'optionalDependencies'].find(
    d => dep in pkgJson[d]
  )
  return pkgJson[deps][dep]
}

const processDeps = (conf: Config, depType: string): Config => {
  const processed = { ...conf }

  if (conf.package[depType].length) {
    const deps = {}
    conf.package[depType].forEach(d => (deps[d] = findDep(d)))
    processed.package[depType] = deps
  } else {
    delete processed.package[depType]
  }

  return processed
}

const postFeatureProcess = (conf: Config): Config => {
  let processed = { ...conf }

  processed = processDeps(processed, 'dependencies')
  processed = processDeps(processed, 'devDependencies')
  processed = processDeps(processed, 'optionalDependencies')

  if (conf.projectType === 'Command Line Tool') {
    processed.package.bin = {
      [conf.package.name]: conf.package.main
    }
  }

  return processed
}

export default async (args: Arguments): Promise<void> => {
  const processDir: string = process.cwd()
  const dirPath: string = isAbsolute(args.dir)
    ? args.dir
    : join(processDir, args.dir)

  info("Target directory '" + dirPath + "'")
  info('Creating temporary directory')
  const tmpDir: SynchronousResult = dirSync() // create tmp dir

  const cleanup = (): void => {
    info('Cleaning temporary directory')
    removeSync(tmpDir.name)
  }

  try {
    const pkgName: string = basename(dirPath)
    const author: string = userInfo().username
    const description: string = pkgName + ' by ' + author

    const initConf: Config = {
      targetDir: dirPath,
      tmpDir: tmpDir.name,
      package: {
        name: pkgName,
        description,
        version: '0.0.1',
        author,
        main: 'src/main.js',
        scripts: {
          test: "echo 'Error: no test specified' && exit 1"
        },
        devDependencies: [],
        optionalDependencies: [],
        dependencies: []
      },
      year: new Date().getFullYear(),
      projectType: 'Library',
      features: []
    }

    const defaultConf: Config = deepmerge(initConf, {
      package: {
        license: 'Apache-2.0'
      },
      features: allFeatures
    })

    isGitRepo(initConf) && info('Found git configuration in target directory')

    // check if target dir exists and if so, it really is a directory
    if (existsSync(dirPath)) {
      if (!statSync(dirPath).isDirectory()) {
        throw Error("'" + dirPath + "' is not a directory")
      }
      warn("Directory '" + dirPath + "' already exists.")
    }

    const config = async (type: string): Promise<Config> => {
      switch (type) {
        case 'minimal':
          return minimal(defaultConf, initConf)
        case 'prompt':
          return prompts(defaultConf, initConf)
        case 'defaults':
          return defaults(defaultConf, initConf)
        default:
          throw Error("Invalid config type '" + type + "'")
      }
    }

    const prompt = async (): Promise<Config> => {
      divider()
      if (existsSync(dirPath)) {
        if (!(await confirmOverwrite())) {
          divider()
          cleanup()
          warn('Cancelled')
          process.exit(1)
        }
      }
      const opts: Config = await config(await configChoices())
      divider()
      return opts
    }

    let conf: Config
    // check if a configuration method is set in args
    if (args.config) {
      info("Configration method: '" + args.config + "'")
      conf = await config(args.config || '')
    } else {
      conf = await prompt()
    }

    info('Configuring features: ')
    // execute each feature
    conf = preFeatureProcess(conf)
    conf = execFeats(conf)
    conf = postFeatureProcess(conf)

    // write package.json
    write(await format(conf.package), join(tmpDir.name, 'package.json'))

    const copyFiles = (): void => {
      // make sure target dir exists
      if (!existsSync(dirPath)) {
        info("Creating project directory '" + dirPath + "'")
        mkdirpSync(dirPath)
      }

      info('Copying project files')
      copySync(tmpDir.name, dirPath) // copy tmp dir contents
    }

    args['dry-run']
      ? info('Dry run enabled: skipped copying project files')
      : copyFiles()
  } finally {
    cleanup()
  }
}
