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
        cream: "var(--cream)",
        sand: "var(--sand)",
        copper: "var(--copper)",
        mocha: "var(--mocha)"
      },
      boxShadow: {
        halo: "0 0 80px rgba(212, 153, 95, 0.22)"
      },
      backgroundImage: {
        noise:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at 80% 0%, rgba(212,153,95,0.09), transparent 24%), radial-gradient(circle at 50% 100%, rgba(84,49,30,0.5), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
