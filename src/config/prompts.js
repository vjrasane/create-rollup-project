import deepmerge from 'deepmerge'
import Enquirer from 'enquirer'
import list from 'prompt-list'
import checkbox from 'prompt-checkbox'

import { getGitUrl } from './defaults'

import type { Options } from './types'

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

export const prompts = (opts: Options): Enquirer => {
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
    default: opts.package.name
  })
  enquirer.question('projectVersion', 'Project version?', {
    default: opts.package.version
  })
  enquirer.question('projectType', 'Project type?', {
    type: 'list',
    default: opts.projectType,
    choices: ['Library', 'Command Line Tool']
  })
  enquirer.question('authorName', 'Author name?', {
    default: opts.package.author
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
    default: [
      ...opts.featureList,
      'all',
      'bundling',
      'style',
      'testing',
      'misc'
    ],
    choices: features
  })

  enquirer.question('githubUrl', 'Github URL?', {
    default: opts.package.repository.url
  })
  enquirer.question('license', 'License?', {
    type: 'list',
    default: opts.package.license,
    choices: [
      'Apache-2.0',
      'MIT',
      'ISC',
      'BSD-3-Clause',
      'GPL-3.0',
      'LGPL-3.0',
      'Other'
    ]
  })
  enquirer.question('otherLicense', 'Other license?')

  return enquirer
}

const getUserOpts = async (defaultOpts: Options): Options => {
  let enquirer = prompts(defaultOpts)

  const answers: Object = await enquirer.ask([
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
      description: answers.projectName + ' by ' + answers.authorName
    },
    projectType: answers.projectType
  })

  // set git repository according to previous answers
  answerOpts.package.repository = {
    type: 'git',
    url: getGitUrl(answerOpts)
  }

  // must overwrite entire array, otherwise its merged
  answerOpts.featureList = answers.features

  // update enquirer so that default values are set correctly
  enquirer = prompts(answerOpts)

  // ask github url if feature is enabled
  if (answers.features.includes('github')) {
    const { githubUrl }: string = await enquirer.ask('githubUrl')
    answerOpts.package.repository.url = githubUrl
    answerOpts.projectLink = githubUrl
      .split('/') // split the URI to path parts
      .splice(-2) // take two last parts
      .join('/') // combine them back to a string
  } else {
    // remove default repository if feature is disabled
    delete answerOpts.package.repository
  }

  // ask license if feature is enabled
  if (answers.features.includes('license')) {
    let { license }: string = await enquirer.ask('license')
    if (license === 'Other') {
      license = await enquirer.ask('otherLicense').otherLicense
    }
    answerOpts.package.license = license
  } else {
    // remove default repository if feature is disabled
    delete answerOpts.package.license
  }

  return answerOpts
}

export default (defaultOpts: Options): Options => getUserOpts(defaultOpts)
