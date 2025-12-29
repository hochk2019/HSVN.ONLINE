import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Golden brand colors - deeper, richer tones
                golden: {
                    50: "#FDF8E1",
                    100: "#FCF0C3",
                    200: "#F9E085",
                    300: "#F5CE47",
                    400: "#E5B820",
                    500: "#C9A227", // Primary brand color
                    DEFAULT: "#C9A227",
                    600: "#A68620",
                    700: "#856B1A",
                    800: "#654F13",
                    900: "#44360D",
                    950: "#231B06",
                },
                // Neutral colors - high contrast
                slate: {
                    50: "#F8FAFC",
                    100: "#F1F5F9",
                    200: "#E2E8F0",
                    300: "#CBD5E1",
                    400: "#94A3B8",
                    500: "#64748B",
                    600: "#475569",
                    700: "#334155",
                    800: "#1E293B",
                    900: "#0F172A",
                    950: "#020617",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
                heading: ["Outfit", "system-ui", "sans-serif"],
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: "1rem",
                    sm: "2rem",
                    lg: "4rem",
                    xl: "5rem",
                },
                screens: {
                    sm: "640px",
                    md: "768px",
                    lg: "1024px",
                    xl: "1200px",
                },
            },
            boxShadow: {
                'golden': '0 4px 14px 0 rgba(201, 162, 39, 0.25)',
                'golden-lg': '0 10px 40px 0 rgba(201, 162, 39, 0.3)',
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
    ],
};

export default config;
