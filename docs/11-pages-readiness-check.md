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

Grepo Hub is a client-side Angular app. The important smoke checks are:

```text
[ ] / loads the app
[ ] /planner-v2 loads the app directly after browser refresh
[ ] Unknown client-side paths route back into the app instead of showing a host-level 404
[ ] No top-level 404.html is added unless static-host routing is intentionally changed
```

For Cloudflare Pages, the app relies on the platform SPA fallback behavior by keeping no top-level `404.html` file.

## Metadata and assets

```text
[ ] Browser title says Grepo Hub
[ ] Meta description exists
[ ] Viewport meta tag exists
[ ] base href remains /
[ ] favicon links point to existing public assets
[ ] No old GrepoPlan metadata remains in the public page shell
```

## Security headers

The `public/_headers` file is copied into the static output and should remain small and conservative.

Current baseline:

```text
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), geolocation=(), microphone=()
```

Do not add a Content-Security-Policy casually. Angular production builds and inline/runtime behavior should be checked carefully before enabling CSP.

## Local smoke test without deployment

After building, serve the static output with a local static server and check the routes manually.

```powershell
npm run build
npx http-server dist/grepo-hub -p 4173
```

Then open:

```text
http://localhost:4173/
http://localhost:4173/planner-v2
```

Depending on the local static server, direct refresh of `/planner-v2` may not mimic Cloudflare Pages SPA fallback. Treat the real hosting preview as the final routing check later.

## Automated audit

Run:

```powershell
npm run pages:audit
```

This checks the local source files for the expected page shell, static-hosting headers, route fallback, and missing favicon references.
