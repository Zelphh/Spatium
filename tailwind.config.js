export default {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ...adicione outras cores conforme necessário
      },
    },
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  // ...existing config...
};
