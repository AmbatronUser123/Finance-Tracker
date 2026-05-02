Title: Resolve PostCSS config error during vite-plugin-pwa build

Problem
- Vite build failed with PLUGIN_ERROR in vite-plugin-pwa buildEnd and referenced postcss.config.js (Vercel path alias).
- Root causes:
  - tailwindcss, autoprefixer and Tailwind plugins were not installed
  - ESM postcss.config.js caused loader friction on Vercel
  - css.postcss pointed to a non-existent or incompatible config

Fix
- Converted PostCSS config to CommonJS for broad loader support
- Added resilient plugin loading with warnings
- Installed compatible versions: tailwindcss 3.4.x, postcss 8.4.x, autoprefixer 10.4.x, @tailwindcss/forms, @tailwindcss/typography
- Pointed Vite to postcss.config.cjs

Files
- postcss.config.cjs: loads tailwindcss before autoprefixer with basic error handling
- package.json: devDependencies include tailwindcss, postcss, autoprefixer and Tailwind plugins
- vite.config.ts: css.postcss now points to ./postcss.config.cjs
- scripts/check-postcss.cjs: minimal reproduction to exercise PostCSS pipeline

Compatibility
- Vite 5.x + PostCSS 8.x + Tailwind 3.4.x + autoprefixer 10.x
- vite-plugin-pwa 0.20.x works with Vite 5.x

Local verification
- npm run postcss:check
- npm run build

Vercel notes
- Use Node 18+ runtime
- Ensure postcss.config.cjs is included in the repo
- The error path (@/vercel/path0/postcss.config.js) should disappear once Vercel picks up the .cjs config and all plugins are installed

If failures persist
- Remove yarn/npm caches and re-install
- Check that @tailwindcss/forms and @tailwindcss/typography are installed
- Confirm that vite.config.ts -> css.postcss points to the .cjs file
