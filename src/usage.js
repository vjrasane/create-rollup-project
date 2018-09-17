import usage from 'command-line-usage'

export default usage([
  {
    header: 'Overview',
    content:
      'Creates a skeleton project with Rollup configuration as well as some other useful goodies'
  },
  {
    header: 'Synopsis',
    content: [
      '$ create-rollup-project {underline directory}',
      '$ create-rollup-project {bold --target} {underline directory}',
      '$ create-rollup-project {underline directory} {bold --config} {underline prompt}|defaults|minimal',
      '$ create-rollup-project {bold --help}'
    ]
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'help',
        alias: 'h',
        description: 'Display this usage guide',
        type: Boolean
      },
      {
        name: 'target',
        alias: 't',
        description: 'Target directory path',
        typeLabel: '{underline directory}'
      },
      {
        name: 'config',
        alias: 'c',
        description: 'Configuration method'
      },
      {
        name: 'dry-run',
        description: 'Run without actually writing files',
        type: Boolean
      }
    ]
  },
  {
    content:
      'Project home: {underline https://github.com/vjrasane/create-rollup-project}'
  }
])
