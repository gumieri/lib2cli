const minimist = require('minimist')
const path = require('path')

const Settings = require('./settings')
const printHelp = require('./help')

function walk ({
  project,
  parameters,
  pastParameters = [],
  settings,
  help = false
}) {
  const { helpCommand, words } = settings

  if (project.hasOwnProperty('command')) {
    return {
      command: project[words.command],
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
  if (helpCommand && nextCommand === 'help') {
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

  return walk({ project: next, parameters, pastParameters, settings, help })
}

async function execute ({
  command,
  parameters,
  pastParameters,
  flags,
  paths,
  doc,
  settings
}) {
  try {
    switch (typeof command) {
      case 'object':
        printHelp({ command, pastParameters, paths, doc, settings })
        process.exit(1)
        break

      case 'function':
        await command(...parameters, flags)
        break
    }
  } catch (err) {
    printHelp({ command, pastParameters, paths, doc, settings, err })
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
  const settings = Settings.load(params.settings)

  const { helpFlag, words } = settings

  const args = params[words.args] ? params[words.args] : process.argv

  let project = params[words.commands]
  if (params.hasOwnProperty(words.lib)) {
    project = params[words.lib]
  }

  let doc = params
  if (params.hasOwnProperty(words.doc)) {
    doc = params[words.doc]
  }

  const { parameters: initialParameters, flags, paths } = parseArgs(args)

  const { command, parameters, pastParameters, help } = walk({
    parameters: initialParameters,
    settings,
    project
  })

  if ((helpFlag && flags.help) || help) {
    printHelp({ command, pastParameters, paths, doc, settings })
    return
  }

  return execute({
    command,
    parameters,
    pastParameters,
    flags,
    paths,
    doc,
    settings
  })
}

module.exports = {
  run,
  walk,
  help: printHelp,
  parseArgs,
  execute
}
