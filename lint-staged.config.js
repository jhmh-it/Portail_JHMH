module.exports = {
  // TypeScript/JavaScript files
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write', 'git add'],

  // JSON files
  '*.{json}': ['prettier --write', 'git add'],

  // CSS/SCSS files
  '*.{css,scss,sass}': ['prettier --write', 'git add'],

  // Markdown files
  '*.{md,mdx}': ['prettier --write', 'git add'],

  // YAML files
  '*.{yml,yaml}': ['prettier --write', 'git add'],
};
