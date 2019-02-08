import test from 'ava'
import path from 'path'
import { Console } from 'console'
import { Writable } from 'stream'
import getStream from 'get-stream'

import help from './help'
import Settings from './settings'

class MyWritable extends Writable {
  constructor (options) {
    super(options)
  }

  _write (chunk, encoding, callback) {
    options += chunk.toString('utf-8')
  }
}

test('help', async t => {
  const args = ['path/to/nodejs', 'path/to/bin/cli', 'first-command']

  const paths = {
    executor: path.parse(args.shift()),
    application: path.parse(args.shift())
  }
  const command = () => 'first command output'
  const pastParameters = []

  const doc = {
    description: 'program description',
    commands: {
      'first-command': {
        description: 'first command description'
      }
    }
  }

  let outString = ''
  let errString = ''
  const settings = Settings.load({
    console: new Console({
      stdout: new MyWritable(outString),
      stderr: new MyWritable(errString)
    })
  })

  help({ command, pastParameters, paths, doc, settings })

  t.deepEqual(errString, '')
})
