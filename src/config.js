/* @flow */

import { basename } from 'path'
import { existsSync, statSync } from 'fs'
import git from 'parse-git-config'
import { userInfo } from 'os'
import deepmerge from 'deepmerge'
import { dirSync } from 'tmp'
import { template } from './template'
import { mkdirpSync, removeSync, copySync } from 'fs-extra'
import prompts, { confirm, allFeatures } from './prompts'
import { info, warn, divider } from './logging'
import execFeats from './features'
import pkgJson from '../package'

const GIT_ORIGIN = 'remote "origin"'

export default async dirPath => {
  info("Target directory '" + dirPath + "'")
  info('Creating temporary directory')
  const tmpDir: Object = dirSync() // create tmp dir

  const cleanup = () => {
    info('Cleaning temporary directory')
    removeSync(tmpDir.name) // delete tmp dir finally
  }

  try {
    const defaultOpts: Object = {
      tmpDir: tmpDir.name,
      package: {
        name: basename(dirPath),
        version: '0.0.1',
        author: userInfo().username,
        main: 'src/main.js',
        scripts: {
          test: "echo 'Error: no test specified' && exit 1"
        },
        license: 'Apache-2.0',
        dependencyPkgs: []
      },
      year: (new Date()).getFullYear(),
      featureList: allFeatures
    }

    defaultOpts.package.description =
      defaultOpts.package.name + ' by ' + defaultOpts.package.author

    const gitConf = git.sync({ cwd: dirPath, path: '.git/config' })
    if (GIT_ORIGIN in gitConf) {
      info('Found git configuration in target directory')
      const gitUrl = gitConf[GIT_ORIGIN].url
      defaultOpts.projectLink = gitUrl
        /*
        * Split by ':'. If the url starts with 'http://'
        * we get the url without protocol, if it starts
        * with 'git@<url>:', we get the project path
        */
        .split(':')[1]
        .split('/') // split the URI to path parts
        .splice(-2) // take two last parts
        .join('/') // combine them back to a string

      // replace 'git@' with protocol
      let url = gitUrl.startsWith('git@')
        ? gitUrl.replace('git@', 'https://')
        : gitUrl

      // make sure starts with 'git+'
      if (!url.startsWith('git+')) {
        url = 'git+' + url
      }

      // make sure ends with '.git'
      if (!url.endsWith('.git')) {
        url += '.git'
      }

      defaultOpts.package.repository = {
        type: 'git',
        url
      }
    }

    const enquirer = prompts(defaultOpts)

    const questions = async () => {
      const answers = await enquirer.ask([
        'projectName',
        'projectVersion',
        'authorName',
        'features'
      ])

      const answerOpts = {
        package: {
          name: answers.projectName,
          version: answers.projectVersion,
          author: answers.authorName
        }
      }

      if (defaultOpts.package.repository) {
        const answer = await confirm(
          'Set project repository? (' + defaultOpts.package.repository.url + ')'
        )
        answer || delete defaultOpts.package.repository
      }

      if (answers.features.includes('license')) {
        let { license } = await enquirer.ask('license')
        if (license === 'Other') {
          license = await enquirer.ask('otherLicense').otherLicense
        }
        answerOpts.package.license = license
      } else {
        delete defaultOpts.package.license
      }

      const merged = deepmerge(defaultOpts, answerOpts)

      merged.featureList = answers.features

      return merged
    }

    if (existsSync(dirPath)) {
      if (!statSync(dirPath).isDirectory()) {
        throw new Error("'" + dirPath + "' is not a directory")
      }
      warn("Directory '" + dirPath + "' already exists.")
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

    const { howConfig } = await enquirer.ask(['howConfig'])
    let userOpts = defaultOpts
    switch (howConfig) {
      case 'Answer questions':
        userOpts = await questions() // get user input
        divider()
        break
      default:
        divider()
        info('Using default settings')
        // do nothing and use defaults
        break
    }

    // set feature flags
    userOpts.features = {}
    userOpts.featureList.forEach(f => {
      userOpts.features[f] = true
    })
    // remove raw string feature list
    delete userOpts.featureList
    // execute each feature
    const opts = execFeats(userOpts)

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

    // make sure target dir exists
    if (!existsSync(dirPath)) {
      info("Creating project directory '" + dirPath + "'")
      mkdirpSync(dirPath)
    }

    info('Copying project files')
    copySync(tmpDir.name, dirPath) // copy tmp dir contents
  } finally {
    cleanup()
  }
}
