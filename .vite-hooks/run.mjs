import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { stripVTControlCharacters } from 'node:util'

const require = createRequire(import.meta.url)
const [command, ...args] = process.argv.slice(2)
const vitePlus = resolve(dirname(require.resolve('vite-plus/package.json')), 'bin/vp')
const commands = {
  staged: [vitePlus, 'staged'],
  'format-check': [vitePlus, 'run', '--no-cache', 'format:check'],
  commitlint: [resolve(dirname(require.resolve('@commitlint/cli/package.json')), 'cli.js')],
}

if (!Object.hasOwn(commands, command)) {
  throw new Error(`Unknown Git hook command: ${command}`)
}

const env = { ...process.env, NO_COLOR: '1' }
delete env.FORCE_COLOR
delete env.CLICOLOR_FORCE

const child = spawn(process.execPath, [...commands[command], ...args], {
  env,
  stdio: ['inherit', 'pipe', 'pipe'],
})

// Vite+ native diagnostics can ignore NO_COLOR. Filter complete lines so ANSI
// sequences split across stream chunks are also removed in Git GUI output.
for (const [input, output] of [
  [child.stdout, process.stdout],
  [child.stderr, process.stderr],
]) {
  createInterface({ input, crlfDelay: Infinity }).on('line', (line) => {
    output.write(`${stripVTControlCharacters(line)}\n`)
  })
}

child.on('error', (error) => {
  console.error(stripVTControlCharacters(error.message))
  process.exitCode = 1
})
child.on('close', (code) => {
  process.exitCode = code ?? 1
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => child.kill(signal))
}
