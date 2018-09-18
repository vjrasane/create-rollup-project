import deepmerge from 'deepmerge'
import Enquirer from 'enquirer'
import list from 'prompt-list'
import checkbox from 'prompt-checkbox'

import { getGitUrl } from './defaults'

import type { Config } from './types'

const bundling: Array<string> = ['rollup', 'babel']
const style: Array<string> = ['eslint', 'standard', 'flow']
const testing: Array<string> = ['jest', 'husky', 'travis', 'coveralls']
const misc: Array<string> = [
  'dummies',
  'readme',
  'license',
  'publish',
  'github'
]

export const allFeatures: Array<string> = [
  ...bundling,
  ...style,
  ...testing,
  ...misc
]

export const prompts = (conf: Config): Enquirer => {
  const enquirer: Enquirer = new Enquirer()
  // register additional prompt types
  enquirer.register('list', list)
  enquirer.register('checkbox', checkbox)

  enquirer.question(
    'howConfig',
    'How would you like to configure the project?',
    {
      type: 'list',
      default: 'Use defaults',
      choices: ['Use defaults', 'Answer questions']
    }
  )
  enquirer.question('projectName', 'Project name?', {
    default: conf.package.name
  })
  enquirer.question('projectVersion', 'Project version?', {
    default: conf.package.version
  })
  enquirer.question('projectType', 'Project type?', {
    type: 'list',
    default: conf.projectType,
    choices: ['Library', 'Command Line Tool']
  })
  enquirer.question('authorName', 'Author name?', {
    default: conf.package.author
  })

  const features: Object = {
    bundling,
    style,
    testing,
    misc
  }

  enquirer.question('features', 'Features? (Space to (de)select)', {
    type: 'checkbox',
    radio: true,
    default: [...conf.features, 'all', 'bundling', 'style', 'testing', 'misc'],
    choices: features
  })

  enquirer.question('githubUrl', 'Github URL?', {
    default: conf.package.repository ? conf.package.repository.url : null
  })
  enquirer.question('license', 'License?', {
    type: 'list',
    default: conf.package.license,
    choices: [
      'Apache-2.0',
      'MIT',
      'ISC',
      'BSD-3-Clause',
      'GPL-3.0',
      'LGPL-3.0'
    ]
  })
  return enquirer
}

export default async (defaults: Config, init: Config): Config => {
  const answers: Object = await prompts(defaults).ask([
    'projectName',
    'projectVersion',
    'projectType',
    'authorName',
    'features'
  ])

  const answerConf: Config = deepmerge(init, {
    package: {
      name: answers.projectName,
      version: answers.projectVersion,
      author: answers.authorName,
      description: answers.projectName + ' by ' + answers.authorName
    },
    projectType: answers.projectType,
    features: answers.features
  })

  // create enquirer with new default values
  const enquirer = prompts(
    deepmerge(
      defaults,
      deepmerge(answerConf, {
        package: {
          repository: {
            type: 'git',
            url: getGitUrl(answerConf)
          }
        }
      })
    )
  )

  const extraQuestions = {
    github: async opts => {
      const { githubUrl }: string = await enquirer.ask('githubUrl')
      opts.package.repository = {
        type: 'git',
        url: githubUrl
      }
    },
    license: async opts => {
      let { license }: string = await enquirer.ask('license')
      opts.package.license = license
    }
  }

  const questions = Object.keys(extraQuestions).filter(f =>
    answers.features.includes(f)
  )
  for (const q of questions) {
    await extraQuestions[q](answerConf)
  }

  return answerConf
}
