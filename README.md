# rollup-template
Basic configuration for Rollup and other useful things

[![License][asl-2.0 badge]][asl-2.0] [![Build Status][travis badge]][travis] [![Coverage Status][coverage badge]][coveralls] [![npm version][npm badge]][npm]

## Installation

### Project dependencies

Install with yarn (duh)

```
yarn install
```

### Flow types

Install flow typed dependencies

```
flow-typed install
```

## Travis Deployment

### NPM auth token

Your NPM Auth Token can be obtained by:

1. Log in to your NPM account, and generate a new token at https://www.npmjs.com/settings/USER/tokens, where USER is the name of the user account which is capable of publishing the npm package.

1. Use the NPM CLI command npm adduser to create a user, then open the ~/.npmrc file:
    *  For NPM v2+, use the authToken value.
    * For NPM ~1, use the auth value.

Always encrypt your auth token. Assuming you have the Travis CI command line client installed, you can do it like this:

```
$ travis encrypt YOUR_AUTH_TOKEN --add deploy.api_key
```

[Coverage badge]: https://coveralls.io/repos/github/vjrasane/rollup-template/badge.svg?service=github
[Coveralls]: https://coveralls.io/github/vjrasane/rollup-template
[ASL-2.0 badge]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[ASL-2.0]: https://opensource.org/licenses/Apache-2.0
[Travis]: https://travis-ci.org/vjrasane/rollup-template
[Travis badge]: https://travis-ci.org/vjrasane/rollup-template.svg?branch=master&service=github
[npm badge]: https://badge.fury.io/js/rollup-template.svg?service=github
[npm]: https://badge.fury.io/js/rollup-template