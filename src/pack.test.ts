import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import test from 'ava'

type PackedFile = {
  path: string
}

type PackResult = {
  files: PackedFile[]
}

// Builds the package the same way `prepack` does (excluding tests and
// storybook via tsconfig.build.json) into an isolated temp directory, then
// packs from there. This must not touch the repo's shared `dist`, since
// `pretest` builds it with the plain tsconfig (tests included, so AVA can
// load the compiled test files) while this suite is still running.
function getPublishedFiles(): string[] {
  const root = process.cwd()
  const stagingDir = mkdtempSync(path.join(tmpdir(), 'ink-playing-cards-pack-'))

  try {
    execFileSync(
      'npx',
      [
        '--loglevel=error',
        'tsc',
        '-p',
        'tsconfig.build.json',
        '--outDir',
        path.join(stagingDir, 'dist'),
      ],
      { cwd: root, encoding: 'utf8' }
    )
    cpSync(
      path.join(root, 'package.json'),
      path.join(stagingDir, 'package.json')
    )
    cpSync(path.join(root, 'readme.md'), path.join(stagingDir, 'readme.md'))
    cpSync(path.join(root, 'LICENSE'), path.join(stagingDir, 'LICENSE'))
    cpSync(path.join(root, 'skills'), path.join(stagingDir, 'skills'), {
      recursive: true,
    })

    const output = execFileSync(
      'npm',
      ['pack', '--dry-run', '--json', '--ignore-scripts', '--loglevel=error'],
      { cwd: stagingDir, encoding: 'utf8' }
    )
    const results = JSON.parse(output) as PackResult[]
    const [result] = results
    if (!result) {
      throw new Error('npm pack produced no output')
    }

    return result.files.map((file) => file.path)
  } finally {
    rmSync(stagingDir, { recursive: true, force: true })
  }
}

// Built once in `before` and shared by every test below: the build + pack
// takes tens of seconds, and both tests only ever read the same file list.
let publishedFiles: string[]

test.before((t) => {
  t.timeout(120_000)
  publishedFiles = getPublishedFiles()
})

test('npm pack includes the built entry point and skills', (t) => {
  t.true(publishedFiles.includes('dist/index.js'))
  t.true(publishedFiles.some((file) => file.startsWith('skills/')))
  t.true(publishedFiles.includes('package.json'))
  t.true(publishedFiles.includes('readme.md'))
  t.true(publishedFiles.includes('LICENSE'))
})

test('npm pack excludes tests, storybook, and examples', (t) => {
  t.false(publishedFiles.some((file) => file.includes('.test.')))
  t.false(publishedFiles.some((file) => file.includes('.spec.')))
  t.false(publishedFiles.some((file) => file.includes('storybook')))
  t.false(publishedFiles.some((file) => file.startsWith('examples/')))
})
