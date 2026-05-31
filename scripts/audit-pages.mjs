import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const warnings = [];

function readText(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

function warn(message) {
  warnings.push(message);
}

function assertIncludes(text, value, message) {
  if (!text.includes(value)) {
    warn(message);
  }
}

function extractHrefs(indexHtml) {
  const hrefs = [];
  const linkPattern = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/g;
  let match;
  while ((match = linkPattern.exec(indexHtml)) !== null) {
    hrefs.push(match[1]);
  }
  return hrefs;
}

function stripQuery(value) {
  return value.split('?')[0];
}

const indexHtmlPath = 'src/index.html';
if (!exists(indexHtmlPath)) {
  warn('Missing src/index.html.');
} else {
  const indexHtml = readText(indexHtmlPath);
  assertIncludes(indexHtml, '<title>Grepo Hub</title>', 'src/index.html should use the expected Grepo Hub browser title.');
  assertIncludes(indexHtml, '<base href="/"', 'src/index.html should keep <base href="/"> for root static hosting.');
  assertIncludes(indexHtml, 'name="viewport"', 'src/index.html should include a viewport meta tag.');
  assertIncludes(indexHtml, 'name="description"', 'src/index.html should include a meta description.');

  const iconLinks = extractHrefs(indexHtml).filter((href) => stripQuery(href).startsWith('favicon.'));
  if (iconLinks.length === 0) {
    warn('src/index.html should reference at least one favicon asset.');
  }

  for (const href of iconLinks) {
    const assetPath = `public/${stripQuery(href)}`;
    if (!exists(assetPath)) {
      warn(`src/index.html references missing public asset: ${stripQuery(href)}`);
    }
  }
}

const projectJsonPath = 'project.json';
if (!exists(projectJsonPath)) {
  warn('Missing project.json.');
} else {
  const projectJson = JSON.parse(readText(projectJsonPath));
  const outputPath = projectJson?.targets?.build?.options?.outputPath;
  if (outputPath !== 'dist/grepo-hub') {
    warn(`Unexpected build outputPath: ${String(outputPath)}. Expected dist/grepo-hub.`);
  }
}

const routesPath = 'src/app/app.routes.ts';
if (!exists(routesPath)) {
  warn('Missing src/app/app.routes.ts.');
} else {
  const routes = readText(routesPath);
  assertIncludes(routes, "path: 'planner-v2'", "Routes should keep a stable /planner-v2 entry for refresh/deep-link checks.");
  assertIncludes(routes, "path: '**'", 'Routes should keep a wildcard fallback route.');
}

if (exists('public/404.html')) {
  warn('public/404.html exists. For Cloudflare Pages SPA fallback, keep no top-level 404.html unless routing is intentionally changed.');
}

const headersPath = 'public/_headers';
if (!exists(headersPath)) {
  warn('Missing public/_headers for static hosting security headers.');
} else {
  const headers = readText(headersPath);
  assertIncludes(headers, '/*', 'public/_headers should define a /* rule.');
  assertIncludes(headers, 'X-Frame-Options: DENY', 'public/_headers should deny iframe embedding unless intentionally needed.');
  assertIncludes(headers, 'Referrer-Policy: strict-origin-when-cross-origin', 'public/_headers should set a referrer policy.');
  assertIncludes(headers, 'X-Content-Type-Options: nosniff', 'public/_headers should set nosniff.');
  assertIncludes(headers, 'Permissions-Policy:', 'public/_headers should set a permissions policy.');
  assertIncludes(headers, 'Content-Security-Policy:', 'public/_headers should set a content security policy.');
  assertIncludes(headers, "default-src 'self'", 'public/_headers CSP should default to self.');
  assertIncludes(headers, "object-src 'none'", 'public/_headers CSP should block plugin/object content.');
  assertIncludes(headers, "frame-ancestors 'none'", 'public/_headers CSP should block iframe embedding.');
  assertIncludes(headers, "base-uri 'self'", 'public/_headers CSP should restrict base URIs.');
}

if (warnings.length > 0) {
  console.error('Pages audit failed:');
  for (const warning of warnings) {
    console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log('Pages audit passed.');
