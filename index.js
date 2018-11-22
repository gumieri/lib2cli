const minimist = require('minimist')
const path = require('path')

const printHelp = require('./help')

function walk ({ project, parameters, pastParameters = [], help = false }) {
  if (project.hasOwnProperty('command')) {
    return {
      command: project.command,
      parameters,
      pastParameters,
      help
    }
  }

  if (parameters.length === 0 || typeof project !== 'object') {
    return {
      command: project,
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

  const next = project[nextCommand]

  if (typeof next === 'undefined') {
    return {
      command: project,
      parameters,
      pastParameters,
      help
    }
  }

  pastParameters.push(nextCommand)

  return walk({ project: next, parameters, pastParameters, help })
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

function run (params) {
  if (params.args === undefined) params.args = process.argv

  const { parameters: initialParameters, flags, paths } = parseArgs(params.args)

  let doc = params
  let project = params.commands
  if (params.hasOwnProperty('lib') && params.hasOwnProperty('doc')) {
    doc = params.doc
    project = params.lib
  }

  const { command, parameters, pastParameters, help } = walk({
    parameters: initialParameters,
    project
  })

  if (flags.help || help) {
    printHelp({ command, pastParameters, paths, doc })
    return
  }

  return execute({ command, parameters, pastParameters, flags, paths, doc })
}

module.exports = {
  run,
  walk,
  help: printHelp,
  execute
}
