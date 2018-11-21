const minimist = require('minimist')
const path = require('path')

const printHelp = require('./help')

function walkLib ({ lib, parameters, pastParameters = [], help = false }) {
  if (parameters.length === 0 || typeof lib !== 'object') {
    return {
      command: lib,
      parameters,
      pastParameters,
      help
    }
  }

  let nextCommand = parameters.shift()
  if (nextCommand === 'help') {
    nextCommand = parameters.shift()
    help = true
  }

  const next = lib[nextCommand]

  if (typeof next === 'undefined') {
    return {
      command: lib,
      parameters,
      pastParameters,
      help
    }
  }

  pastParameters.push(nextCommand)

  return walkLib({ lib: next, parameters, pastParameters, help })
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
        printHelp({ command, pastParameters, paths, doc })
        process.exit(1)
        break

      case 'function':
        await command(...parameters, flags)
        break
    }
  } catch (err) {
    printHelp({ command, pastParameters, paths, doc, err })
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

  const { command, parameters, pastParameters, help } = walkLib({
    parameters: initialParameters,
    lib
  })

  if (flags.help || help) {
    printHelp({ command, pastParameters, paths, doc })
    return
  }

  return execute({ command, parameters, pastParameters, flags, paths, doc })
}

module.exports = {
  run,
  help: printHelp,
  walkLib,
  execute
}
