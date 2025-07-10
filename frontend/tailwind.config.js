module.exports = {
  purge: {
    enabled: true,
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/index.html',
    ],
    options: {
      safelist: [],
    },
  },
  darkMode: `media`, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        gliko: [
          'Gliko',
          'Gliko-fallback',
          'Gliko-roboto',
          'Gliko-local',
          'Georgia',
          'Times',
          'Serif',
        ],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}