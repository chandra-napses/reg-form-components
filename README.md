# reg-form-components

Section components for the registration form, fetched at runtime with a dynamic
`import()` rather than bundled into the form itself.

```
src/sections/*.jsx   source
dist/v3/*.js         built modules — committed, this is what the form fetches
dist/v3/manifest.json  section list with the fields each one declares
```

## Build

```bash
npm install
npm run build     # src/sections/*.jsx -> dist/v3/
npm test          # renders every built module with host-shaped props
npm run check     # both
```

`dist/` is committed. The form points at the built files, so a source change
that is not rebuilt and committed keeps serving the previous build — CI fails
the PR if `dist/` is stale.

The output version lives in `build.mjs` (`const VERSION = 'v3'`). Bumping it
publishes to a new directory and leaves the old one in place for forms still
pointing at it.

## The module contract

Both rules are load-bearing, and the build is configured to preserve them:

1. **No imports.** The published form bundle resolves bare specifiers through a
   host-populated registry a separately-imported module cannot reach, so any
   import here would hit the browser's own resolver and throw. Every dependency
   arrives as an argument — `ui`, `SelectField`, `TextAreaField`, `codeLists`,
   `form`, `watch`, `hostErrors`, `locked`.
2. **The default export is `create(React)`, not a component.** Built with the
   classic JSX transform so `React.createElement` binds to that parameter
   instead of a global that may not be set when the module evaluates.

Each module also exports `fields`, the leaf names it renders. The form checks
them against its own zod schema before mounting; the schema lives in the form,
not here, so a field added here alone is not validated server-side.

`npm test` asserts both rules against the built output, renders each section,
and checks that every declared field actually appears.

## Sections

| Section | Card id | Code lists it reads |
| --- | --- | --- |
| `cash-management` | `cash-management` | `CASH_MANAGEMENT_SWEEPS`, `SWEEP_TYPES`, `REDEEM_SEQUENCES` |
| `suitability` | `suitability` | `INVESTMENT_OBJECTIVES`, `RISK_TOLERANCES`, `TIME_HORIZONS`, `LIQUIDITY_NEEDS`, `INVESTMENT_EXPERIENCE_LEVELS`, `ANNUAL_INCOME_RANGES`, `NET_WORTH_RANGES`, `LIQUID_NET_WORTH_RANGES`, `TAX_BRACKETS`, `SOURCE_OF_FUNDS` |

Every code list defaults to an empty array, so a host that has not published one
yet renders an empty control instead of throwing during render.

## Adding a section

1. Write `src/sections/<name>.jsx` following the contract above.
2. `npm run check`.
3. Commit the source **and** `dist/`.

The build discovers sections from the directory — there is no list to update.
