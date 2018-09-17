/* @flow */

import Enquirer from 'enquirer'
import list from 'prompt-list'
import checkbox from 'prompt-checkbox'
import Confirm from 'prompt-confirm'

import type { Options } from './types'

export const confirm = (question: string): Promise<boolean> =>
  new Confirm(question).run()

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

  const features: Array<string> = {
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
