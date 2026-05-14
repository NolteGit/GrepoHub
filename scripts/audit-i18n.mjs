import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const languages = ['en', 'de'];
const dictionaries = Object.fromEntries(
  languages.map((language) => [
    language,
    JSON.parse(readFileSync(join(root, 'public', 'assets', 'i18n', `${language}.json`), 'utf8')),
  ]),
);
const errors = [];

function walk(directory, predicate, files = []) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (!['node_modules', 'dist', '.angular', 'coverage'].includes(entry)) {
        walk(path, predicate, files);
      }
      continue;
    }

    if (predicate(path)) {
      files.push(path);
    }
  }

  return files;
}

function normalizePath(path) {
  return relative(root, path).replaceAll('\\', '/');
}

function addError(message) {
  errors.push(message);
}

const [baseLanguage, ...otherLanguages] = languages;
const baseKeys = new Set(Object.keys(dictionaries[baseLanguage]));

for (const language of otherLanguages) {
  const languageKeys = new Set(Object.keys(dictionaries[language]));

  for (const key of baseKeys) {
    if (!languageKeys.has(key)) {
      addError(`${language} is missing translation key: ${key}`);
    }
  }

  for (const key of languageKeys) {
    if (!baseKeys.has(key)) {
      addError(`${language} has extra translation key: ${key}`);
    }
  }
}

for (const [language, dictionary] of Object.entries(dictionaries)) {
  for (const [key, value] of Object.entries(dictionary)) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      addError(`${language}.${key} is empty or not a string`);
    }
  }
}

const sourceFiles = walk(
  join(root, 'src', 'app'),
  (path) => /\.(ts|html)$/.test(path) && !path.endsWith('.spec.ts'),
);
const translationKeyPatterns = [
  /['"]([a-zA-Z][\w.-]*\.[\w.-]+)['"]\s*\|\s*translate/g,
  /\btranslate\(\s*['"]([a-zA-Z][\w.-]*\.[\w.-]+)['"]/g,
];

for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf8');
  const filePath = normalizePath(file);

  for (const pattern of translationKeyPatterns) {
    for (const match of content.matchAll(pattern)) {
      const key = match[1];

      for (const language of languages) {
        if (key.endsWith('.') || !(key in dictionaries[language])) {
          if (key.endsWith('.')) {
            continue;
          }
          addError(`${filePath} uses missing ${language} translation key: ${key}`);
        }
      }
    }
  }
}

const htmlAllowList = new Set(['DE', 'EN', 'GitHub', 'Noltenius', '×']);
const staticAttributePattern = /\s(aria-label|title|placeholder|alt)="([^"]*[A-Za-zÀ-ž][^"]*)"/g;
const textNodePattern = />\s*([^<>{}@]*[A-Za-zÀ-ž][^<>{}@]*)\s*</g;

for (const file of sourceFiles.filter((path) => path.endsWith('.html'))) {
  const filePath = normalizePath(file);
  let content = readFileSync(file, 'utf8')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/{{[\s\S]*?}}/g, '');

  for (const match of content.matchAll(staticAttributePattern)) {
    const [, attribute, value] = match;

    if (
      !value.includes('| translate') &&
      !value.includes('{{') &&
      !htmlAllowList.has(value.trim())
    ) {
      addError(`${filePath} has static ${attribute} text without translate pipe: ${value.trim()}`);
    }
  }

  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  for (const match of content.matchAll(textNodePattern)) {
    const text = match[1].replace(/\s+/g, ' ').trim();

    if (text && !htmlAllowList.has(text) && !/[="[\]]/.test(text)) {
      addError(`${filePath} has visible text without translate pipe: ${text}`);
    }
  }
}

if (errors.length > 0) {
  console.error('i18n audit failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`i18n audit passed for ${baseKeys.size} keys across ${languages.join(', ')}.`);
