# Contributing to ink-playing-cards

Thank you for your interest in contributing! This document covers the workflow for making changes to this project.

## Prerequisites

- **Node.js** ≥ 20 (see `engines` in `package.json`)
- **Yarn** (classic or modern — a `yarn.lock` is committed; use yarn, not npm)
- A GitHub account and basic familiarity with git

## Setup

```sh
git clone https://github.com/gfargo/ink-playing-cards.git
cd ink-playing-cards
yarn install --frozen-lockfile
```

## Development loop

Start the interactive storybook to iterate on components:

```sh
yarn dev
```

This runs `npx tsx ./src/storybook/storybook.tsx` and lets you see live rendering in the terminal.

## Build

```sh
yarn build   # tsc — compiles src/ → dist/
```

The `pretest` hook runs `yarn build` automatically before tests, so you usually don't need to run this separately.

## Tests

Tests are written with [AVA](https://github.com/avajs/ava) and live in `src/`:

```sh
yarn test         # build + ava
yarn test:fix     # build + lint:fix + ava --update-snapshots
```

If you add new functionality, add a corresponding test. If you change rendered output, update snapshots with `yarn test:fix`.

## Linting

The project uses [XO](https://github.com/xojs/xo) (wraps ESLint) and Prettier for formatting:

```sh
yarn lint        # check
yarn lint:fix    # auto-fix
```

Fix all lint errors before opening a PR — CI enforces this.

## Commit message convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Your commit subject must be one of:

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `refactor` | Code change that is neither a feat nor a fix |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons, etc.; no logic change |
| `test` | Adding or correcting tests |
| `perf` | Performance improvements |
| `chore` | Build process, dependency updates, tooling (hidden in changelog) |

Example: `feat(card): add suit color prop`

`chore` commits are hidden from the release changelog. All other types above appear under their respective sections.

## Pull request process

1. **Fork** the repo and create a branch from `main`: `git checkout -b feat/my-feature`
2. Make your changes — keep the diff minimal and focused.
3. Run `yarn build && yarn test && yarn lint` and confirm all pass locally.
4. Open a PR against `main` and fill in the PR template.
5. CI (GitHub Actions) must be green before review.
6. A maintainer will review and merge.

## Code of conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to uphold it.
