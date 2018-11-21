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
  const nextLib = lib[nextCommand]

  if (typeof nextLib === 'undefined') {
    return {
      command: lib,
      parameters,
      pastParameters
    }
  }

  pastParameters.push(nextCommand)

  return walkLib({ lib: nextLib, parameters, pastParameters })
}

async function execute ({
  command,
  parameters,
  pastParameters,
  flags,
  paths,
  doc
}) {
  try {
    switch (typeof command) {
      case 'object':
        help({ command, pastParameters, paths, doc })
        break

      case 'function':
        await command(...parameters, flags)
        break

      case 'undefined':
        process.exit(1)
        break
    }
  } catch (err) {
    help({ command, pastParameters, paths, doc, err })
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

  for (key of Object.keys(flags)) {
    const cammelKey = key.replace(/\W+(.)/g, (_, c) => c.toUpperCase())
    flags[cammelKey] = flags[key]
  }

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
