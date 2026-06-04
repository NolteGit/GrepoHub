# Pages Readiness Check

This checklist is for static hosting readiness only. It does not require deploying the app.

## Build output

```text
[ ] npm run build completes successfully
[ ] Build output is created at dist/grepo-hub
[ ] Static public assets are copied into the build output
[ ] favicon.svg and favicon.ico exist in the output
[ ] _headers exists in the output
```

## Static routing

GrepoPlan is a client-side Angular app. The important smoke checks are:

```text
[ ] / loads the app
[ ] /planner loads the app directly after browser refresh
[ ] /planner-v2 still loads as a legacy alias
[ ] Unknown client-side paths route back into the app instead of showing a host-level 404
[ ] No top-level 404.html is added unless static-host routing is intentionally changed
```

For Cloudflare Pages, the app relies on the platform SPA fallback behavior by keeping no top-level `404.html` file.

## Metadata and assets

```text
[ ] Browser title says GrepoPlan
[ ] Meta description exists
[ ] Viewport meta tag exists
[ ] base href remains /
[ ] favicon links point to existing public assets
[ ] No old GrepoHub metadata remains in the public page shell
```

## Security headers

The `public/_headers` file is copied into the static output and should remain small and conservative.

Current baseline:

```text
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), geolocation=(), microphone=()
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; upgrade-insecure-requests
```

CSP changes should be tested with a production build and browser console open. If a future feature adds external APIs, fonts, images, or analytics, update `connect-src`, `font-src`, `img-src`, or `script-src` deliberately instead of broadening `default-src`.

## Small-screen behavior

The planner is currently optimized for desktop and medium-width screens. Narrow screens show a notice because toolbox and summary areas are intentionally hidden at small widths.

```text
[ ] Narrow viewport shows the small-screen notice
[ ] Core planner content remains readable
[ ] No horizontal page overflow appears
[ ] Hidden toolbox/sidebar functionality is still acceptable for the release target
```

## Local smoke test without deployment

After building, serve the static output with a local static server and check the routes manually.

```powershell
npm run build
npx http-server dist/grepo-hub/browser -p 4173
```

Then open:

```text
http://localhost:4173/
http://localhost:4173/planner
http://localhost:4173/planner-v2
```

Depending on the local static server, direct refresh of `/planner` or `/planner-v2` may not mimic Cloudflare Pages SPA fallback. Treat the real hosting preview as the final routing check later.

## Automated audit

Run:

```powershell
npm run pages:audit
```

This checks the local source files for the expected page shell, static-hosting headers, route fallback, CSP baseline, small-screen notice, and missing favicon references.

For a full release gate, run:

```powershell
npm run release:check
```
