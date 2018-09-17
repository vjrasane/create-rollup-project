/* @flow */

import { basename, join, isAbsolute } from 'path'
import { existsSync, statSync } from 'fs'

import { userInfo } from 'os'
import { dirSync } from 'tmp'
import { mkdirpSync, removeSync, copySync } from 'fs-extra'
import List from 'prompt-list'
import Confirm from 'prompt-confirm'

import { info, warn, divider } from '../logging'
import { template } from '../template'
import execFeats from '../features'
import pkgJson from '../../package'

import defaults, { isGitRepo } from './defaults'
import minimal from './minimal'
import prompts, { allFeatures } from './prompts'

import type { SynchronousResult } from 'tmp'
import type { Options, Arguments } from '../types'

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

    const defaultOpts: Options = {
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
        license: 'Apache-2.0',
        repository: {},
        devDependencies: {}
      },
      dependencyPkgs: [],
      year: new Date().getFullYear(),
      featureList: allFeatures,
      features: {},
      projectType: 'Library'
    }

    isGitRepo(defaultOpts) &&
      info('Found git configuration in target directory')

    // check if target dir exists and if so, it really is a directory
    if (existsSync(dirPath)) {
      if (!statSync(dirPath).isDirectory()) {
        throw Error("'" + dirPath + "' is not a directory")
      }
      warn("Directory '" + dirPath + "' already exists.")
    }

    const config = async (type: string): Promise<Options> => {
      switch (type) {
        case 'minimal':
          return minimal(defaultOpts)
        case 'prompt':
          return prompts(defaultOpts)
        case 'defaults':
          return defaults(defaultOpts)
        default:
          throw Error("Invalid config type '" + type + "'")
      }
    }

    const prompt = async (): Promise<Options> => {
      divider()
      if (existsSync(dirPath)) {
        if (!(await confirmOverwrite())) {
          divider()
          cleanup()
          warn('Cancelled')
          process.exit(1)
        }
      }
      const opts: Options = await config(await configChoices())
      divider()
      return opts
    }

    let userOpts: Options
    // check if a configuration method is set in args
    if (args.config) {
      info("Configration method: '" + args.config + "'")
      userOpts = await config(args.config || '')
    } else {
      userOpts = await prompt()
    }
    // set feature flags
    userOpts.featureList.forEach(f => {
      userOpts.features[f] = true
    })
    // remove raw string feature list
    delete userOpts.featureList

    info('Configuring features: ')
    // execute each feature
    const opts: Options = execFeats(userOpts)

    // set dev dependency versions based on current package.json
    opts.dependencyPkgs.forEach(
      d => (opts.package.devDependencies[d] = pkgJson.devDependencies[d])
    )
    // remove fields that arent needed
    delete opts.dependencyPkgs

    // write package.json
    template('package.json.template', opts)

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
