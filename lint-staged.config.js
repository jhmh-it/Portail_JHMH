module.exports = {
  // TypeScript/JavaScript files
  '*.{js,jsx,ts,tsx}': ['eslint --fix --max-warnings 0', 'prettier --write'],

  // Style files (CSS, TailwindCSS)
  '*.{css,scss,sass}': ['prettier --write'],

  // Configuration files
  '*.{json,jsonc}': ['prettier --write'],

  // Config files
  '*.{yml,yaml}': ['prettier --write'],

  // TypeScript config files
  'tsconfig.json': ['prettier --write'],

  // Package files
  'package.json': ['prettier --write'],
};
