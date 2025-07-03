const tailwind = require("@tailwindcss/postcss");

module.exports = {
  plugins: [
    tailwind(), // use the wrapper, not 'tailwindcss' directly
    require("autoprefixer"),
  ],
};
