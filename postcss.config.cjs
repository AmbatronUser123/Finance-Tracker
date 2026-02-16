/** @type {import('postcss-load-config').Config} */
module.exports = () => {
  const plugins = [];
  try {
    // ensure Tailwind runs before autoprefixer
    const tailwindcss = require('tailwindcss');
    plugins.push(tailwindcss());
  } catch (e) {
    console.warn('[postcss] tailwindcss not found, skipping Tailwind CSS');
  }
  try {
    const autoprefixer = require('autoprefixer');
    plugins.push(autoprefixer());
  } catch (e) {
    console.warn('[postcss] autoprefixer not found, continuing without autoprefixer');
  }
  return { plugins };
};
