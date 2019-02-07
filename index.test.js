import test from 'ava'
import lib2cli from '.'
import Settings from './settings'

test('run', async t => {
  const args = ['path/to/nodejs', 'path/to/bin/cli', 'first-command']

  const program = {
    description: 'program description',
    commands: {
      'first-command': {
        description: 'first command description',
        command: () => 'first command output'
      }
    }
  }

  const running = lib2cli.run({ args, ...program })
  await t.notThrowsAsync(running)
})

test('run lib', async t => {
  const args = ['path/to/nodejs', 'path/to/bin/cli', 'first-command']

  const program = {
    lib: {
      description: 'program description',
      'first-command': {
        description: 'first command description',
        command: () => 'first command output'
      }
    }
  }

  const running = lib2cli.run({ args, ...program })
  await t.notThrowsAsync(running)
})

test('run command directly', async t => {
  const args = ['path/to/nodejs', 'path/to/bin/cli', 'param']

  const program = {
    description: 'single command description',
    command: () => 'first command output'
  }

  const running = lib2cli.run({ args, ...program })
  await t.notThrowsAsync(running)
})

test('parseArgs', async t => {
  const args = ['path/to/nodejs', 'path/to/bin/cli', '--flag', 'value', 'param']

  const parsed = lib2cli.parseArgs(args)

  const expected = {
    parameters: ['param'],
    flags: { flag: 'value' },
    paths: {
      executor: {
        root: '',
        dir: 'path/to',
        base: 'nodejs',
        ext: '',
        name: 'nodejs'
      },
      application: {
        root: '',
        dir: 'path/to/bin',
        base: 'cli',
        ext: '',
        name: 'cli'
      }
    }
  }

  t.deepEqual(parsed, expected)
})

test('walk - empty parameters', async t => {
  const result = lib2cli.walk({
    project: {},
    parameters: [],
    settings: Settings.load({})
  })

  const expected = {
    command: {},
    parameters: [],
    pastParameters: [],
    help: false
  }

  t.deepEqual(result, expected)
})

test('walk - help command', async t => {
  const project = { commands: { cmd: { command: () => {} } } }
  const parameters = ['help', 'cmd']
  const result = lib2cli.walk({
    project,
    parameters,
    settings: Settings.load({ helpCommand: true })
  })

  const expected = {
    command: project,
    parameters,
    pastParameters: [],
    help: true
  }

  t.deepEqual(result, expected)
})

test('walk - help command disabled', async t => {
  const project = { commands: { cmd: { command: () => {} } } }
  const parameters = ['help', 'cmd']
  const result = lib2cli.walk({
    project,
    parameters,
    settings: Settings.load({ helpCommand: false })
  })

  const expected = {
    command: project,
    parameters,
    pastParameters: [],
    help: false
  }

  t.deepEqual(result, expected)
})
