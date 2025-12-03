/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
    "./node_modules/onborda/dist/**/*.{js,ts,jsx,tsx}", // Add this
  ],
  theme: {
    fontFamily: {
      sans: ["geist"],
      mono: ["geist-mono"],
    },
    extend: {
      container: {
        center: true,
        screens: {
          lg: "1100px",
          xl: "1280px",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        tremor: {
          brand: {
            faint: "hsl(var(--muted))",
            muted: "hsl(var(--muted))",
            subtle: "hsl(var(--primary))",
            DEFAULT: "hsl(var(--primary))",
            emphasis: "hsl(var(--primary))",
            inverted: "hsl(var(--background))",
          },
          background: {
            muted: "hsl(var(--muted))",
            subtle: "hsl(var(--accent))",
            DEFAULT: "hsl(var(--background))",
            emphasis: "hsl(var(--foreground))",
          },
          border: {
            DEFAULT: "hsl(var(--border))",
          },
          ring: {
            DEFAULT: "hsl(var(--ring))",
          },
          content: {
            subtle: "hsl(var(--muted-foreground))",
            DEFAULT: "hsl(var(--foreground))",
            emphasis: "hsl(var(--foreground))",
            strong: "hsl(var(--foreground))",
            inverted: "hsl(var(--background))",
          },
        },
        "dark-tremor": {
          brand: {
            faint: "hsl(var(--muted))",
            muted: "hsl(var(--muted))",
            subtle: "hsl(var(--primary))",
            DEFAULT: "hsl(var(--primary))",
            emphasis: "hsl(var(--primary))",
            inverted: "hsl(var(--background))",
          },
          background: {
            muted: "hsl(var(--muted))",
            subtle: "hsl(var(--accent))",
            DEFAULT: "hsl(var(--background))",
            emphasis: "hsl(var(--foreground))",
          },
          border: {
            DEFAULT: "hsl(var(--border))",
          },
          ring: {
            DEFAULT: "hsl(var(--ring))",
          },
          content: {
            subtle: "hsl(var(--muted-foreground))",
            DEFAULT: "hsl(var(--foreground))",
            emphasis: "hsl(var(--foreground))",
            strong: "hsl(var(--foreground))",
            inverted: "hsl(var(--background))",
          },
        },
      },
      boxShadow: {
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      fontSize: {
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "infinite-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(var(--scroll, -150%))" },
        },
        "infinite-scroll-y": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(var(--scroll, -150%))" },
        },
        // Text appear animation
        "text-appear": {
          "0%": {
            opacity: "0",
            transform: "rotateX(45deg) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "rotateX(0deg) scale(1)",
          },
        },
        // Table pinned column shadow animation
        "table-pinned-shadow": {
          "0%": { filter: "drop-shadow(rgba(0, 0, 0, 0.1) -2px 10px 6px)" },
          "100%": { filter: "drop-shadow(rgba(0, 0, 0, 0) -2px 10px 6px)" },
        },
        // OTP caret blink animation
        "caret-blink": {
          "0%,70%,100%": { opacity: "0" },
          "20%,50%": { opacity: "1" },
        },
        // Pulse scale animation used for onboarding/welcome
        "pulse-scale": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        // Gradient move animation for gradient text
        "gradient-move": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        // Novas animações para carregamento da página
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "infinite-scroll": "infinite-scroll 22s linear infinite",
        "infinite-scroll-y": "infinite-scroll-y 22s linear infinite",
        "text-appear": "text-appear 0.15s ease",
        "table-pinned-shadow": "table-pinned-shadow cubic-bezier(0, 0, 1, 0)",
        "caret-blink": "caret-blink 1s ease-out infinite",
        "pulse-scale": "pulse-scale 6s ease-out infinite",
        "gradient-move": "gradient-move 5s linear infinite",
        // Novas animações para carregamento da página
        fadeIn: "fadeIn 0.8s ease-in-out forwards",
        slideUp: "slideUp 0.8s ease-in-out forwards",
        slideDown: "slideDown 0.8s ease-in-out forwards",
        slideIn: "slideIn 0.8s ease-in-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwind-highlightjs"),
  ],
};
export default config;
