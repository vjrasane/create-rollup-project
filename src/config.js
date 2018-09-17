/* @flow */

import { basename, join, isAbsolute } from 'path'
import { existsSync, statSync } from 'fs'
import git from 'parse-git-config'
import { userInfo } from 'os'
import deepmerge from 'deepmerge'
import { dirSync } from 'tmp'
import { template } from './template'
import { mkdirpSync, removeSync, copySync } from 'fs-extra'
import { prompts, confirm, allFeatures } from './prompts'
import { info, warn, divider } from './logging'

import execFeats from './features'
import pkgJson from '../package'

import type { SynchronousResult } from 'tmp'
import type { Config } from 'parse-git-config'
import type { Options, Arguments } from './types'

const GIT_ORIGIN = 'remote "origin"'

export default async (args: Arguments): Promise<void> => {
  const processDir: string = process.cwd()
  const dirPath: string = isAbsolute(args.dir)
    ? args.dir
    : join(processDir, args.dir)

  info("Target directory '" + dirPath + "'")
  info('Creating temporary directory')
  const tmpDir: SynchronousResult = dirSync() // create tmp dir

  if (existsSync(dirPath)) {
    if (!statSync(dirPath).isDirectory()) {
      throw new Error("'" + dirPath + "' is not a directory")
    }
    warn("Directory '" + dirPath + "' already exists.")
  }

  const cleanup = () => {
    info('Cleaning temporary directory')
    removeSync(tmpDir.name) // delete tmp dir finally
  }

  try {
    const pkgName: string = basename(dirPath)
    const author: string = userInfo().username
    const description: string = pkgName + ' by ' + author

    const gitUrl = (name: string, author: string, log: boolean): string => {
      const gitConf: Config = git.sync({ cwd: dirPath, path: '.git/config' })
      let url: string = ''
      if (GIT_ORIGIN in gitConf) {
        log && info('Found git configuration in target directory')
        url = gitConf[GIT_ORIGIN].url
        // replace 'git@' with protocol
        if (url.startsWith('git@')) {
          url = url.replace(':', '/').replace('git@', 'https://')
        }

        // make sure starts with 'git+'
        if (!url.startsWith('git+')) {
          url = 'git+' + url
        }

        // make sure ends with '.git'
        if (!url.endsWith('.git')) {
          url = url + '.git'
        }
      } else {
        url = ['git+https://github.com', author, name + '.git'].join('/')
      }
      return url
    }

    const defaultOpts: Options = {
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
        dependencyPkgs: [],
        repository: {
          type: 'git',
          url: gitUrl(pkgName, author, true)
        }
      },
      year: new Date().getFullYear(),
      featureList: allFeatures,
      projectType: 'Library'
    }

    const prompt = async () => {
      const basicEnq = prompts(defaultOpts)
      const questions = async () => {
        const answers: Object = await basicEnq.ask([
          'projectName',
          'projectVersion',
          'projectType',
          'authorName',
          'features'
        ])

        const answerOpts: Options = deepmerge(defaultOpts, {
          package: {
            name: answers.projectName,
            version: answers.projectVersion,
            author: answers.authorName,
            description: answers.projectName + ' by ' + answers.authorName,
            repository: {
              type: 'git',
              url: gitUrl(answers.projectName, answers.authorName)
            }
          },
          featureList: answers.features,
          projectType: answers.projectType
        })

        const detailsEnq = prompts(answerOpts)

        if (answers.features.includes('github')) {
          const { githubUrl }: string = await detailsEnq.ask('githubUrl')
          answerOpts.package.repository.url = githubUrl
          answerOpts.projectLink = githubUrl
            .split('/') // split the URI to path parts
            .splice(-2) // take two last parts
            .join('/') // combine them back to a string
        } else {
          delete answerOpts.package.repository
        }

        if (answers.features.includes('license')) {
          let { license }: string = await detailsEnq.ask('license')
          if (license === 'Other') {
            license = await detailsEnq.ask('otherLicense').otherLicense
          }
          answerOpts.package.license = license
        } else {
          delete answerOpts.package.license
        }

        divider()
        return answerOpts
      }

      if (existsSync(dirPath)) {
        divider()
        const sure: string =
          'Are you sure you want to configure an existing directory?'
        const overwrite: boolean = await confirm(sure)
        if (!overwrite) {
          cleanup()
          warn('Cancelled')
          process.exit(1)
        }
      } else {
        divider()
      }

      const { howConfig } = await basicEnq.ask(['howConfig'])

      switch (howConfig) {
        case 'Answer questions':
          return questions() // get user input
        default:
          divider()
          info('Using default settings')
          return defaultOpts // do nothing and use defaults
      }
    }

    const userOpts = args.defaults ? defaultOpts : await prompt()
    // set feature flags
    userOpts.features = {}
    userOpts.featureList.forEach(f => {
      userOpts.features[f] = true
    })
    // remove raw string feature list
    delete userOpts.featureList

    info('Configuring features: ')
    // execute each feature
    const opts: Options = execFeats(userOpts)

    // set dev dependency versions based on current package.json
    opts.package.devDependencies = {}
    opts.package.dependencyPkgs.forEach(
      d => (opts.package.devDependencies[d] = pkgJson.devDependencies[d])
    )
    // remove fields that arent needed
    delete opts.package.dependencyPkgs
    delete opts.features

    // write package.json
    template('package.json.template', opts)

    if (!args['dry-run']) {
      // make sure target dir exists
      if (!existsSync(dirPath)) {
        info("Creating project directory '" + dirPath + "'")
        mkdirpSync(dirPath)
      }

      info('Copying project files')
      copySync(tmpDir.name, dirPath) // copy tmp dir contents
    } else {
      info('Dry run enabled: skipped copying project files')
    }
  } finally {
    cleanup()
  }
}
