const columnify = require('columnify')

const columnsConfig = {
  columnSplitter: '\t',
  minWidth: 12,
  showHeaders: false
}

function walkDoc ({ doc, pastParameters }) {
  const f = (foundDoc, parameter) => {
    if (!foundDoc.hasOwnProperty('commands')) return {}

    return foundDoc.commands[parameter]
  }

  return pastParameters.reduce(f, doc)
}

function printParameters ({ commandDoc }) {
  let parametersDoc = {}
  Object.keys(commandDoc.parameters).forEach((parameter, i) => {
    parametersDoc[`${i + 1}. ${parameter}`] =
      commandDoc.parameters[parameter].description
  })

  const parametersHelp = columnify(parametersDoc, columnsConfig)
  console.log(`parameters:\n${parametersHelp}\n`)
}

function printFlags ({ commandDoc }) {
  let parametersDoc = {}
  Object.keys(commandDoc.flags).forEach((flag, i) => {
    parametersDoc[`--${flag}`] = commandDoc.flags[flag].description
  })

  const flagsHelp = columnify(parametersDoc, columnsConfig)
  console.log(`flags:\n${flagsHelp}\n`)
}

function printHelp ({ commandDoc }) {
  if (commandDoc === undefined) return undefined

  if (commandDoc.hasOwnProperty('parameters')) {
    printParameters({ commandDoc })
  }

  if (commandDoc.hasOwnProperty('flags')) {
    printFlags({ commandDoc })
  }
}

module.exports = ({ command, pastParameters, paths, doc, err }) => {
  if (err) console.log(`${err.message}\n`)

  const commandPath = [paths.application.name].concat(pastParameters).join(' ')

  console.log(`usage: ${commandPath} <command> [<args>]\n`)

  const commandDoc = walkDoc({ doc, pastParameters })

  if (commandDoc !== undefined && commandDoc.hasOwnProperty('description')) {
    console.log(`${commandDoc.description}\n`)
  }

  switch (typeof command) {
    case 'function':
      printHelp({ commandDoc })
      break

    case 'object':
      console.log('possible commands:')
      Object.keys(command).forEach(key => console.log(`\t${key}`))
      break
  }
}
