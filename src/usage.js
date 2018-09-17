import cliUsage from 'command-line-usage'

export default cliUsage([
  {
    header: 'Overview',
    content:
      'Creates a skeleton project with Rollup configuration as well as some other useful goodies'
  },
  {
    header: 'Synopsis',
    content: [
      '$ create-rollup-project [{bold --target|-t}] {underline directory}',
      '$ create-rollup-project [{bold --target|-t}] {underline directory} [{bold --dry-run}]',
      '$ create-rollup-project [{bold --help|-h}]'
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
        name: 'defaults',
        description: 'Use default values without prompting user',
        type: Boolean
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
