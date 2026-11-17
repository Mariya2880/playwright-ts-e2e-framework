# Contributing

## Workflow

1. Branch from `main`: `feat/<short-name>` or `fix/<short-name>`
2. Keep PRs focused on one feature or fix
3. Use [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `test:`, `ci:`
4. Open a PR using the structure: **What / Why / Key decisions / How it was tested**
5. Merge only when **Lint & typecheck** and **E2E tests** are green

## Before pushing

```bash
npm run lint
npm run typecheck
npm test
```

## Writing tests

- Put selectors in page objects (`pages/`), never in specs
- Get page objects from fixtures (`fixtures/test.ts`); don't use `new XPage(page)` in a spec
- Prefer `getByRole` / `getByPlaceholder`, then `getByTestId`. Avoid CSS/XPath
- Never use `waitForTimeout`; use web-first assertions (`await expect(locator)...`)
- Generate data with the builders in `utils/`; never rely on data created by another test
- Tag every test: `@smoke` for the critical path, `@regression` for everything else
- Known product bugs: describe the correct behaviour, mark `test.fail()` and link the issue
