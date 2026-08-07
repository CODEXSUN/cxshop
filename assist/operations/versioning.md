# Versioning and Releases

## Version policy

CXShop uses lockstep versions for the root package and all workspaces.

Package versions use `1.0.<reference>`.
Git tags use `v-1.0.<reference>`.
Changelog labels use `v 1.0.<reference>`.

The active changelog is `assist/documentation/CHANGELOG.md`.

## Version state

The changelog starts with these values:

- Current numeric version
- Current release tag
- Current changelog label

All package files, the package lock, deployment sample, and changelog state must match.

## Version bump

Only bump a version when the user explicitly requests it.

Use one command:

```text
npm run version:bump -- --title "Title" --database-update
npm run version:bump -- --title "Title" --no-database-update
```

The command updates all workspace package versions, the lockfile, deployment sample, and changelog.

## Changelog entries

Keep historical entries unchanged.
Add new progress to the current version unless the user requests a bump.

Use:

```text
npm run changelog:append -- --title "Title" --note "Exact change" --no-database-update
```

Each entry contains `Database Changes` and `App Codebase Changes`.

## GitHub helper

Run `npm run github:now -- --dry-run` to review the proposed commit.

Run `npm run github:now` only in an interactive terminal.
The helper shows the changelog-derived subject before Git changes.
It asks for one final confirmation before pull, stage, commit, and push.

The helper runs:

```text
git pull --rebase --autostash
git add -A
git commit -m "<subject>"
git push
```

Run `npm run check:versions` before a commit or release.
