import type { TailwindConfig } from '../../types/config';

const config: TailwindConfig = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;