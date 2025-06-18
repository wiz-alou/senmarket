/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // === COULEURS SHADCN/UI ===
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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

        // === PALETTE OCÉAN ATLANTIQUE SÉNÉGAL ===
        ocean: {
          50: '#f0f9ff',   // Écume matinale
          100: '#e0f2fe',  // Brume océanique
          200: '#bae6fd',  // Vague douce
          300: '#7dd3fc',  // Eau cristalline
          400: '#38bdf8',  // Bleu atlantique
          500: '#0ea5e9',  // Océan profond
          600: '#0284c7',  // Bleu royal
          700: '#0369a1',  // Bleu nuit
          800: '#075985',  // Abysses
          900: '#0c4a6e',  // Profondeur marine
          950: '#082f49',  // Mystère océanique
        },

        sand: {
          50: '#fffbeb',   // Sable fin
          100: '#fef3c7',  // Sable doré
          200: '#fed7aa',  // Dune claire
          300: '#fdba74',  // Sable chaud
          400: '#fb923c',  // Terre de Siène
          500: '#f97316',  // Orange africain
          600: '#ea580c',  // Terre rouge
          700: '#c2410c',  // Latérite
          800: '#9a3412',  // Bronze antique
          900: '#7c2d12',  // Acajou sombre
          950: '#431407',  // Ébène profond
        },

        coral: {
          50: '#fef2f2',   // Rose nacré
          100: '#fee2e2',  // Corail tendre
          200: '#fecaca',  // Rose corail
          300: '#fca5a5',  // Corail vif
          400: '#f87171',  // Rouge corail
          500: '#ef4444',  // Rouge passion
          600: '#dc2626',  // Rouge profond
          700: '#b91c1c',  // Rouge royal
          800: '#991b1b',  // Bordeaux
          900: '#7f1d1d',  // Rouge sombre
          950: '#450a0a',  // Grenat
        },

        emerald: {
          50: '#ecfdf5',   // Vert menthe
          100: '#d1fae5',  // Vert tendre
          200: '#a7f3d0',  // Jade clair
          300: '#6ee7b7',  // Émeraude claire
          400: '#34d399',  // Malachite
          500: '#10b981',  // Émeraude
          600: '#059669',  // Vert forestier
          700: '#047857',  // Vert profond
          800: '#065f46',  // Vert sombre
          900: '#064e3b',  // Vert mystique
          950: '#022c22',  // Vert abyssal
        },
      },

      // === ANIMATIONS ===
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow": {
          "0%": { boxShadow: "0 0 20px rgba(14, 165, 233, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(14, 165, 233, 0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.6s ease-out",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}