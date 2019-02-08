const { Console } = require('console')

function load (values) {
  return Object.assign(
    {
      helpFlag: true,
      helpCommand: true,
      console: new Console({ stdout: process.stdout, stderr: process.stderr }),
      words: {
        args: 'args',
        alias: 'alias',
        command: 'command',
        commands: 'commands',
        defaultValue: 'defaultValue',
        description: 'description',
        doc: 'doc',
        flags: 'flags',
        lib: 'lib',
        parameters: 'parameters',
        required: 'required'
      }
    },
    values
  )
}

module.exports = {
  load
}
