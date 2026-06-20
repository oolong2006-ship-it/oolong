/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // الهوية البصرية لنظام RDI
        navy: '#131A2B', // الكحلي الداكن (أساسي)
        gold: '#B8924F', // الذهبي (لمسات)
        cream: '#F7F4ED', // الكريمي (خلفية)
        profit: '#3E7B5A', // الأخضر (ربح)
        loss: '#B23A2F', // الأحمر (خسارة)
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
