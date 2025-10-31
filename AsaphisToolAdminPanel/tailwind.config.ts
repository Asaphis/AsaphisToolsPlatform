import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core tokens mapped to CSS variables (for classes like bg-background, text-foreground, border-border, ring-sidebar-ring)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
        },

        // Border helper tokens to support classes like border-card-border, border-primary-border, etc.
        'card-border': "hsl(var(--card-border))",
        'primary-border': "hsl(var(--primary-border))",
        'secondary-border': "hsl(var(--secondary-border))",
        'destructive-border': "hsl(var(--destructive-border))",
        'accent-border': "hsl(var(--accent-border))",
        'muted-border': "hsl(var(--muted-border))",
        'sidebar-border': "hsl(var(--sidebar-border))",
        'popover-border': "hsl(var(--popover-border))",

        // Sidebar ring token for ring-sidebar-ring
        'sidebar-ring': "hsl(var(--sidebar-ring))",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.03)",
      },
      borderRadius: {
        xl: "var(--radius)",
      },
    },
  },
  plugins: [],
};

export default config;
