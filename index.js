const minimist = require('minimist')
const path = require('path')

const help = require('./help')

function walkLib ({ lib, parameters, pastParameters = [] }) {
  if (parameters.length === 0 || typeof lib !== 'object') {
    return {
      command: lib,
      parameters,
      pastParameters
    }
  }

  const nextCommand = parameters.shift()

  pastParameters.push(nextCommand)

  return walkLib({
    lib: lib[nextCommand],
    parameters,
    pastParameters
  })
}

function execute ({ command, parameters, pastParameters, flags, paths, doc }) {
  switch (typeof command) {
    case 'function':
      return command(...parameters, flags).catch(err => {
        help({ command, pastParameters, paths, doc, err })
        process.exit(1)
      })

    case 'object':
      help({ command, pastParameters, paths, doc })
      process.exit(1)
  }
}

function parseArgs (args) {
  const paths = {
    executor: path.parse(args.shift()),
    application: path.parse(args.shift())
  }

  let flags = minimist(args)
  const parameters = flags._
  delete flags._

  return { parameters, flags, paths }
}

function run ({ args, lib, doc }) {
  if (args === undefined) args = process.argv

  const { parameters: initialParameters, flags, paths } = parseArgs(args)

  const { command, parameters, pastParameters } = walkLib({
    parameters: initialParameters,
    lib
  })

  return execute({ command, parameters, pastParameters, flags, paths, doc })
}

module.exports = {
  run,
  help,
  walkLib,
  execute
}
