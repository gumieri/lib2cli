# lib2cli

Extremely easy library for creating command-line applications, or for converting another libraries to it.

## How to use

First of all:
```bash
npm install lib2cli
```

Second you will call the command `run` to start the CLI:
```javascript
const lib2cli = require('lib2cli')
const myLib = require('./my_lib.js')
const myDoc = require('./doc_of_my_lib.json')

lib2cli.run({ lib: myLib, doc: myDoc })
```

There's two ways of organizing the information for creating the CLI.

One is informing the `lib` as an object or the function itself and also informing the `doc` as an object describing all commands, parameters and flags to create the help text.

Example:

```javascript
const lib2cli = require('lib2cli')

lib2cli.run({
  lib: {
    'be-awesome': ({ awesomeFlag }, param1, param2) => {
      console.log(`I'm awesome! ${param1}, ${param2}, ${awesomeFlag}`)
    }
  }
  doc: {
    description: 'My awesome CLI!',
    commands: {
      'be-awesome': {
        description: 'To be awesome.',
        flags: {
          'awesome-flag': {
            description: `It's a awesome flag!`
          }
        }
        parameters: {
          'First parameter': {
            description: `I'm the first.`
          }, {
          'Second parameter': {
            description: `I'm the second.`
          },
        }
      }
    }
  }
})
```

The other way is to "mix" the functions with the documentation.

Example:

```javascript
const lib2cli = require('lib2cli')

lib2cli.run({
  description: 'My awesome CLI!',
  commands: {
    'be-awesome': {
      command: ({ awesomeFlag }, param1, param2) => {
        console.log(`I'm awesome! ${param1}, ${param2}, ${awesomeFlag}`)
      },
      description: 'To be awesome.',
      flags: {
        'awesome-flag': {
          description: `It's a awesome flag!`
        }
      }
      parameters: {
        'First parameter': {
          description: `I'm the first.`
        }, {
        'Second parameter': {
          description: `I'm the second.`
        },
      }
    }
  }
})
```

### Documentation

#### Description

All the objects of the documentation will have the property `description`, which is the string describing it.
At the top level of the documentation, it will describe the command-line tool itself.

#### Commands

The property `commands` is used if it would have a aggregation of commands.

#### Command

The property `command` is only necessary when using the "mixed" version, when there's no division of the `lib` and `doc`.
It will point to the function to be triggered when caling the command.

#### Flags

The property `flags` object is composed by properties with the name of the flag with it's own properties with the following settings:
- `description`: a string describing the flag
- `alias`: another way to call this flag
- `required`: a boolean to say if it is obligated to be informed or not
- `defaultValue`: to show the value it will recieve if not informed (override as `required = false` if used together)

#### Parameters

The property `parameters` object also is composed by properties with a name describing it and having as value another object with the possible properties of:
- `description`: a string describing the flag
- `required`: a boolean to say if it is obligated to be informed or not
- `defaultValue`: to show the value it will recieve if not informed (override as `required = false` if used together)

### Settings

It's possible to change some behaviors of this lib by informing the property `settings` to the command `run`:

#### `helpFlag`
The CLI tool will accept the flag `--help`. (default: `true`)

#### `helpCommand`
The CLI tool will understand a help command as asking for the help of the next informed word. (default: `true`)

e.g.: `mycli help be-awesome`
#### `words`
To overwrite the properties used by the lib2cli to create the CLI.
- `args`
- `alias`
- `command`
- `commands`
- `defaultValue`
- `description`
- `doc`
- `flags`
- `lib`
- `parameters`
- `required`

### Projects using

Some projects using this lib to serve as example:
- [gumieri/ecsctl.js](https://github.com/gumieri/ecsctl.js)
- [gumieri/aws-spot-manager](https://github.com/gumieri/aws-spot-manager)
