module.exports = {
  prefix: '',
  important: true,
  purge: {
    content: ['./apps/**/*.{html,ts}', './libs/**/*.{html,ts}']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['"Open Sans"', 'sans-serif'],
      serif: ['"Playfair Display"', 'serif']
    },
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: []
};
