# Test Strategy

## 1. Scope

| System under test | Type | Purpose |
| --- | --- | --- |
| [Sauce Demo](https://www.saucedemo.com) | Web UI | E-commerce flows: login, catalogue, cart, checkout |
| [Restful-Booker](https://restful-booker.herokuapp.com) | REST API | Booking CRUD, authentication and authorisation |

**Out of scope:** load and performance testing, mobile viewports, payment providers (Sauce Demo has none), and back-end data stores (no access).

## 2. Risk-based priorities

Effort follows business risk: where a defect would cost money or trust, coverage is deepest.

| Area | Risk if broken | Priority | Coverage |
| --- | --- | --- | --- |
| Checkout and price calculation | Wrong charges, lost orders | **High** | Validation table, cancel flows, totals recalculated independently |
| Authentication and session | Locked-out customers, unauthorised access | **High** | Valid, locked, invalid inputs, auth guard, logout |
| API authorisation | Data changed by unauthenticated callers | **High** | 403 on PUT, PATCH and DELETE with no, empty or forged tokens, plus side-effect checks |
| Cart state | Lost items, wrong badge count | Medium | Add/remove, reload persistence, cross-page consistency |
| Catalogue and sorting | Poor UX, mis-sold items | Medium | All 4 sort orders, list vs details consistency |
| Accessibility | Excluded users, legal exposure | Medium | WCAG 2.1 AA scan of key pages (report mode) |

## 3. Test levels: what is tested where

The rule is **test at the lowest level that can catch the bug**.

- **API tests** (`tests/api`): business rules and authorisation. Fast, stable, no browser.
- **UI tests** (`tests/ui`): behaviour only a user can see: navigation, validation messages, state across pages.
- **One end-to-end journey**: login → sort → cart → checkout → confirmation, as the critical-path smoke test.
- **Known-defect tests**: correct behaviour described and marked `test.fail()`, linked to GitHub issues.

## 4. Test design techniques

- **Equivalence partitioning:** one test per class of invalid login and checkout input, driven from a data table.
- **State transitions:** logged out → logged in → logged out; booking created → updated → patched → deleted → 404.
- **Oracle independence:** expected sort orders and price totals are *calculated* from page data, never copied from the app.
- **Negative and security testing:** every write endpoint is checked with no, empty and forged credentials.

## 5. Test data

- Generated per run with `@faker-js/faker`, so there are no shared, stale fixtures.
- API tests create their own booking through a fixture and delete it afterwards. No test depends on another.
- Demo credentials are public and overridable via `.env` (see `.env.example`).

## 6. Execution and CI

| Trigger | What runs | Browsers |
| --- | --- | --- |
| Pull request / push to `main` | Lint, typecheck, all UI and API tests | Chromium |
| Nightly (03:00 UTC) and manual | Full UI regression | Firefox, WebKit |

- `forbidOnly` and 2 retries in CI, 0 retries locally.
- Traces on first retry, screenshots and video on failure, HTML report as an artifact.
- Tags: `@smoke`, `@regression`, `@e2e`, `@security`, `@a11y`, `@known-bug`. Run a tier with `npx playwright test --grep @smoke`.

## 7. Flakiness policy

- No hard waits (blocked by `eslint-plugin-playwright`); only web-first assertions.
- A flaky test is a bug in the test: fix the cause, don't add retries.
- Example: `ProductDetailsPage.expectLoaded()` waits for an element that only exists on the details page, because the SPA updates the URL before the DOM.

## 8. Exit criteria for merging

- Lint, typecheck and all tests green on the PR
- New behaviour has tests at the appropriate level
- No new `test.only`, hard waits or `force: true`
