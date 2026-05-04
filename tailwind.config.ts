import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--page)",
        "page-soft": "var(--page-soft)",
        "page-elevated": "var(--page-elevated)",
        cream: "var(--cream)",
        sand: "var(--sand)",
        copper: "var(--copper)",
        mocha: "var(--mocha)",
        forest: "var(--forest)",
        ink: "var(--ink)"
      },
      boxShadow: {
        halo: "0 0 80px rgba(124, 147, 82, 0.18)"
      },
      backgroundImage: {
        noise:
          "radial-gradient(circle at 20% 20%, rgba(255,248,237,0.08), transparent 28%), radial-gradient(circle at 80% 0%, rgba(124,147,82,0.12), transparent 24%), radial-gradient(circle at 50% 100%, rgba(123,83,52,0.32), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
