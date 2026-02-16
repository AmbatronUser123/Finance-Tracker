const postcss = require('postcss');

const plugins = [];
try {
  const tailwindcss = require('tailwindcss');
  plugins.push(tailwindcss());
  console.log('[check] tailwindcss loaded');
} catch (e) {
  console.log('[check] tailwindcss not available:', e && e.message);
}

try {
  const autoprefixer = require('autoprefixer');
  plugins.push(autoprefixer());
  console.log('[check] autoprefixer loaded');
} catch (e) {
  console.log('[check] autoprefixer not available:', e && e.message);
}

const css = `
@tailwind base;
@tailwind components;
@tailwind utilities;
.test { display: flex }
`;

postcss(plugins)
  .process(css, { from: undefined })
  .then((res) => {
    console.log('[check] postcss processed successfully, css length:', res.css.length);
  })
  .catch((err) => {
    console.error('[check] postcss processing failed:', err && err.message);
    process.exit(1);
  });
