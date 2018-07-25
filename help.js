const columnify = require('columnify')

function walkDoc ({ doc, pastParameters }) {
  const f = (foundDoc, parameter) => {
    if (!foundDoc.hasOwnProperty('commands')) return {}

    return foundDoc.commands[parameter]
  }

  return pastParameters.reduce(f, doc)
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
      if (commandDoc !== undefined) {
        if (commandDoc.hasOwnProperty('parameters')) {
          let parametersDoc = {}

          Object.keys(commandDoc.parameters).forEach((parameter, i) => {
            parametersDoc[`${i + 1}. ${parameter}`] =
              commandDoc.parameters[parameter].description
          })

          console.log('parameters:')
          console.log(
            columnify(parametersDoc, {
              columnSplitter: '\t',
              minWidth: 12,
              showHeaders: false
            })
          )
          console.log('\n')
        }

        if (commandDoc.hasOwnProperty('flags')) {
          let parametersDoc = {}

          Object.keys(commandDoc.flags).forEach((flag, i) => {
            parametersDoc[`--${flag}`] = commandDoc.flags[flag].description
          })

          console.log('flags:')
          console.log(
            columnify(parametersDoc, {
              columnSplitter: '\t',
              minWidth: 12,
              showHeaders: false
            })
          )
          console.log('\n')
        }
      }
      break

    case 'object':
      console.log('possible commands:')
      Object.keys(command).forEach(key => console.log(`\t${key}`))
      break
  }
}
