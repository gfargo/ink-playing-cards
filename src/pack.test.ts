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
      ['pack', '--dry-run', '--json', '--ignore-scripts'],
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

test('npm pack includes the built entry point and skills', (t) => {
  const files = getPublishedFiles()

  t.true(files.includes('dist/index.js'))
  t.true(files.some((file) => file.startsWith('skills/')))
  t.true(files.includes('package.json'))
  t.true(files.includes('readme.md'))
  t.true(files.includes('LICENSE'))
})

test('npm pack excludes tests, storybook, and examples', (t) => {
  const files = getPublishedFiles()

  t.false(files.some((file) => file.includes('.test.')))
  t.false(files.some((file) => file.includes('.spec.')))
  t.false(files.some((file) => file.includes('storybook')))
  t.false(files.some((file) => file.startsWith('examples/')))
})
