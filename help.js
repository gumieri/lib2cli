const columnify = require('columnify')

const columnsConfig = {
  columnSplitter: '\t',
  showHeaders: false
}

function walk ({ doc, pastParameters, settings }) {
  const { words } = settings

  const f = (foundDoc, parameter) => {
    if (!foundDoc.hasOwnProperty(words.commands)) return foundDoc[parameter]
    return foundDoc.commands[parameter]
  }

  return pastParameters.reduce(f, doc)
}

function printParameters ({ commandDoc, settings }) {
  const { words } = settings

  let parametersDoc = {}
  Object.keys(commandDoc[words.parameters]).forEach((parameter, i) => {
    parametersDoc[`${i + 1}. ${parameter}`] =
      commandDoc.parameters[parameter][words.description]
  })

  const parametersHelp = columnify(parametersDoc, columnsConfig)
  console.log(`parameters:\n${parametersHelp}\n`)
}

function printFlags ({ commandDoc, settings }) {
  const { words } = settings

  const flags = commandDoc[words.flags]

  let flagsDoc = []
  for (flagName of Object.keys(flags)) {
    const flag = flags[flagName]

    const description = flag[words.description]

    let alias = flag[words.alias]
    if (alias) alias = `-${alias}`

    const defaultValue = flag[words.defaultValue]
    let requiredMessage
    if (defaultValue) {
      requiredMessage = `Default: "${defaultValue}"`
    } else if (flag[words.required]) {
      requiredMessage = 'REQUIRED'
    }

    flagsDoc.push({
      complete: `--${flagName}`,
      alias,
      description,
      required: requiredMessage
    })
  }

  const flagsHelp = columnify(flagsDoc, columnsConfig)
  console.log(`flags:\n${flagsHelp}\n`)
}

function printHelp ({ commandDoc, settings }) {
  const { words } = settings

  if (commandDoc === undefined) return undefined

  if (commandDoc.hasOwnProperty(words.parameters)) {
    printParameters({ commandDoc, settings })
  }

  if (commandDoc.hasOwnProperty(words.flags)) {
    printFlags({ commandDoc, settings })
  }
}

module.exports = ({ command, pastParameters, paths, doc, settings, err }) => {
  const { words } = settings

  if (err) console.log(`${err.message}\n`)

  const commandPath = [paths.application.name].concat(pastParameters).join(' ')

  console.log(`usage: ${commandPath} <command> [<args>]\n`)

  const commandDoc = walk({ doc, pastParameters, settings })

  if (
    commandDoc !== undefined &&
    commandDoc.hasOwnProperty(words.description)
  ) {
    console.log(`${commandDoc.description}\n`)
  }

  switch (typeof command) {
    case 'function':
      printHelp({ commandDoc, settings })
      break

    case 'object':
      console.log('possible commands:')
      Object.keys(command)
        .filter(k => k !== words.description)
        .forEach(k => console.log(`\t${k}`))
      break
  }
}
