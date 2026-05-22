import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        virgin: {
          indigo: "#1F1A4F",
          purple: "#511C98",
          red: "#E10A0A",
          black: "#000000",
          white: "#FFFFFF",
        },
      },
      borderRadius: {
        product: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
