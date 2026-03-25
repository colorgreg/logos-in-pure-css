#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'ui-kit.html');

const entries = fs.readdirSync(repoRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => {
    const dir = path.join(repoRoot, name);
    return fs.existsSync(path.join(dir, `${name}.html`)) && fs.existsSync(path.join(dir, `${name}.css`));
  })
  .sort((a, b) => a.localeCompare(b));

const logos = entries.map((name) => {
  const htmlPath = path.join(repoRoot, name, `${name}.html`);
  const template = fs.readFileSync(htmlPath, 'utf8').trim();
  const largeMarkup = template.replace(/\{\{\s*size\s*\}\}/g, 'large');
  const smallMarkup = template.replace(/\{\{\s*size\s*\}\}/g, 'small');

  return {
    name,
    title: name.charAt(0).toUpperCase() + name.slice(1),
    largeMarkup,
    smallMarkup,
    htmlPath: `${name}/${name}.html`,
    cssPath: `${name}/${name}.css`,
    lessPath: `${name}/${name}.less`
  };
});

const stylesheetLinks = logos
  .map((logo) => `    <link rel="stylesheet" href="${logo.cssPath}">`)
  .join('\n');

const cards = logos
  .map((logo) => `
      <article class="logo-card" id="${logo.name}">
        <header>
          <h2>${logo.title}</h2>
          <p><code>${logo.name}</code></p>
        </header>

        <div class="logo-preview-row">
          <div class="logo-preview preview-large">
${indent(logo.largeMarkup, 12)}
          </div>
          <div class="logo-preview preview-small">
${indent(logo.smallMarkup, 12)}
          </div>
        </div>

        <details>
          <summary>HTML snippet</summary>
          <pre><code>${escapeHtml(logo.largeMarkup)}</code></pre>
        </details>

        <p class="logo-files">
          Pliki: <a href="${logo.htmlPath}">${logo.htmlPath}</a> ·
          <a href="${logo.cssPath}">${logo.cssPath}</a> ·
          <a href="${logo.lessPath}">${logo.lessPath}</a>
        </p>
      </article>`)
  .join('\n');

const generatedAt = new Date().toISOString();

const html = `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Logos UI Kit</title>
${stylesheetLinks}
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f6fb;
        --card: #ffffff;
        --text: #1f2937;
        --muted: #6b7280;
        --line: #e5e7eb;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      .page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem 3rem;
      }
      .hero {
        margin-bottom: 1.25rem;
      }
      .hero h1 {
        margin: 0;
      }
      .hero p {
        color: var(--muted);
      }
      .meta {
        margin-top: .5rem;
        font-size: .875rem;
        color: var(--muted);
      }
      .logo-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .logo-card {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .logo-card h2 {
        margin: 0;
      }
      .logo-card header p {
        margin-top: .25rem;
        color: var(--muted);
      }
      .logo-preview-row {
        display: grid;
        grid-template-columns: 1fr 120px;
        gap: .75rem;
        align-items: center;
      }
      .logo-preview {
        border: 1px dashed var(--line);
        border-radius: 8px;
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
      }
      .preview-small {
        min-height: 80px;
      }
      div[class^="logo-"] { display: inline-block; }
      details {
        margin-top: .75rem;
      }
      summary {
        cursor: pointer;
        color: #2563eb;
      }
      pre {
        margin: .5rem 0 0;
        font-size: .75rem;
        line-height: 1.4;
        background: #111827;
        color: #e5e7eb;
        padding: .75rem;
        border-radius: 8px;
        overflow-x: auto;
      }
      .logo-files {
        margin: .75rem 0 0;
        font-size: .875rem;
      }
      .logo-files a {
        color: #2563eb;
        text-decoration: none;
      }
      .logo-files a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <h1>UI kit: logos-in-pure-css</h1>
        <p>Podgląd lokalny/online wszystkich dostępnych elementów + gotowe snippety.</p>
        <p class="meta">Elementów: ${logos.length} · Wygenerowano: ${generatedAt} · Aby odświeżyć: <code>node scripts/generate-ui-kit.js</code></p>
      </section>

      <section class="logo-grid">
${cards}
      </section>
    </main>
  </body>
</html>
`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Generated ${path.relative(repoRoot, outputPath)} with ${logos.length} items.`);

function indent(text, spaces) {
  const prefix = ' '.repeat(spaces);
  return text.split('\n').map((line) => `${prefix}${line}`).join('\n');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
