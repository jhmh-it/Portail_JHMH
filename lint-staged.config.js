module.exports = {
  // TypeScript/JavaScript files
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // JSON files
  '*.json': ['prettier --write'],

  // CSS/SCSS files
  '*.{css,scss,sass}': ['prettier --write'],

  // Markdown files
  '*.{md,mdx}': ['prettier --write'],

  // YAML files
  '*.{yml,yaml}': ['prettier --write'],
};
