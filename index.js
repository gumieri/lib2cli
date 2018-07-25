const minimist = require('minimist')
const path = require('path')

let { argv } = process

const executorPath = path.parse(argv.shift())
const applicationPath = path.parse(argv.shift())

const flags = minimist(argv)
const commands = flags._
delete flags._
usedCommands = []

const walk = property => {
  if (commands.length === 0 || typeof property !== 'object') return property

  const usedCommand = commands.shift()
  usedCommands.push(usedCommand)
  return walk(property[usedCommand])
}

const help = (property, err) => {
  if (err) console.log(err.message)
  console.log()

  const commandPath = [applicationPath.name].concat(usedCommands).join(' ')

  console.log(`usage: ${commandPath} <command> [<args>]`)
  console.log()

  switch (typeof property) {
    case 'function':
      break
    case 'object':
      console.log('possible values:')
      Object.keys(property).forEach(key => console.log(`\t${key}`))
      break
  }
}

const execute = property => {
  switch (typeof property) {
    case 'function':
      return property(...commands, flags).catch(err => {
        help(property, err)
        process.exit(1)
      })

    case 'object':
      help(property)
      process.exit(1)
  }
}

module.exports = {
  walk,
  help,
  execute
}
