import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mainDark: '#1f2937',
        mainLight: '#fff',
        mainGray: '#6b7280',
        mainLightGray: '#d1d5db',
        mainDarkHover: '#374151',
      },
    },
  },
  plugins: [],
} satisfies Config;
