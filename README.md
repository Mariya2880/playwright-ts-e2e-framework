# Playwright + TypeScript E2E Framework

End-to-end UI and API test framework built with **Playwright** and **TypeScript**.

- **UI under test:** [Sauce Demo](https://www.saucedemo.com), a public e-commerce practice app
- **API under test:** [Restful-Booker](https://restful-booker.herokuapp.com), a public booking API

> 🚧 Work in progress. The framework is being built feature by feature through pull requests. See the PR history for the reasoning behind each step.

## Quick start

```bash
npm ci
npx playwright install --with-deps chromium
npm test
```

| Script | What it does |
| --- | --- |
| `npm test` | Run the full suite |
| `npm run test:smoke` | Run only `@smoke` tests |
| `npm run lint` | ESLint incl. `eslint-plugin-playwright` rules |
| `npm run typecheck` | Strict TypeScript check |
| `npm run report` | Open the last HTML report |

## Project structure

```
├── config/        # Environment config (switch with TEST_ENV)
├── fixtures/      # Custom fixtures: page objects, auth, API clients
├── pages/         # Page Object Model classes, one per page
├── tests/
│   ├── ui/        # Browser tests (behavior only, no selectors)
│   └── api/       # API tests
├── utils/         # Pure helpers: test data builders
└── playwright.config.ts
```

## Author

**Mariya Tony Konikkara**, QA Automation Engineer, Berlin
[LinkedIn](https://www.linkedin.com/in/mariya-tony-konikkara)
