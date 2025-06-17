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
      // === PALETTE OCÉAN ATLANTIQUE ===
      colors: {
        // Couleurs système Shadcn
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

        // === COULEURS OCÉAN ATLANTIQUE ===
        ocean: {
          50: '#f0f8ff',
          100: '#e0f1fe',
          200: '#b9e4fd',
          300: '#7bd0fc',
          400: '#36baf8',
          500: '#0ca5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
          deep: '#0E2F4F',
          primary: '#154475',
          medium: '#1F588F',
          light: '#367DB3',
          soft: '#7BAFD4',
          mist: '#B7D5E6',
        },
        
        atlantic: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
          emerald: '#106D63',
          teal: '#199187',
          mint: '#48BBAF',
          foam: '#93DCD2',
        },
        
        sand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
          bronze: '#9C7244',
          gold: '#DAA520',
          warm: '#FFDA93',
          light: '#FFF8DC',
        },
        
        coral: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          red: '#FF6347',
          orange: '#FF8C00',
          pink: '#FFB6C1',
        },
      },

      // === FONTS ===
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
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
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "wave": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "glow": {
          "0%": { boxShadow: "0 0 20px rgba(54, 125, 179, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(54, 125, 179, 0.6)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "wave": "wave 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },

      // === SPACING ===
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      // === BORDER RADIUS ===
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // === BOX SHADOW ===
      boxShadow: {
        'ocean': '0 10px 25px -3px rgba(21, 68, 117, 0.1), 0 4px 6px -2px rgba(21, 68, 117, 0.05)',
        'atlantic': '0 10px 25px -3px rgba(25, 145, 135, 0.1), 0 4px 6px -2px rgba(25, 145, 135, 0.05)',
        'sand': '0 10px 25px -3px rgba(218, 165, 32, 0.1), 0 4px 6px -2px rgba(218, 165, 32, 0.05)',
        'glow': '0 0 20px rgba(54, 125, 179, 0.3)',
        'glow-lg': '0 0 30px rgba(54, 125, 179, 0.4)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      },

      // === BACKGROUND IMAGES ===
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(135deg, rgb(14, 47, 79) 0%, rgb(21, 68, 117) 50%, rgb(31, 88, 143) 100%)',
        'gradient-atlantic': 'linear-gradient(135deg, rgb(16, 109, 99) 0%, rgb(25, 145, 135) 50%, rgb(72, 187, 175) 100%)',
        'gradient-sand': 'linear-gradient(135deg, rgb(156, 114, 68) 0%, rgb(218, 165, 32) 50%, rgb(255, 218, 147) 100%)',
        'gradient-sunset': 'linear-gradient(135deg, rgb(255, 140, 0) 0%, rgb(255, 99, 71) 50%, rgb(255, 182, 193) 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      // === BACKDROP BLUR ===
      backdropBlur: {
        'xs': '2px',
      },

      // === TYPOGRAPHY ===
      typography: {
        DEFAULT: {
          css: {
            'max-width': 'none',
            color: 'rgb(51, 65, 85)',
            '--tw-prose-headings': 'rgb(15, 23, 42)',
            '--tw-prose-links': 'rgb(21, 68, 117)',
            '--tw-prose-bold': 'rgb(15, 23, 42)',
            '--tw-prose-code': 'rgb(15, 23, 42)',
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    
    // Plugin personnalisé pour nos classes utilitaires
    function({ addUtilities, theme }) {
      const newUtilities = {
        // === CONTENEURS ===
        '.container-fluid': {
          maxWidth: theme('screens.2xl'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen sm': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@screen lg': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },
        
        '.section-padding': {
          paddingTop: theme('spacing.16'),
          paddingBottom: theme('spacing.16'),
          '@screen sm': {
            paddingTop: theme('spacing.20'),
            paddingBottom: theme('spacing.20'),
          },
          '@screen lg': {
            paddingTop: theme('spacing.24'),
            paddingBottom: theme('spacing.24'),
          },
        },

        // === BOUTONS PREMIUM ===
        '.btn-ocean': {
          background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(29, 78, 216))',
          color: 'white',
          fontWeight: '600',
          paddingLeft: theme('spacing.6'),
          paddingRight: theme('spacing.6'),
          paddingTop: theme('spacing.3'),
          paddingBottom: theme('spacing.3'),
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.lg'),
          transform: 'translateY(0)',
          transition: 'all 0.3s ease-out',
          '&:hover': {
            background: 'linear-gradient(to right, rgb(29, 78, 216), rgb(30, 64, 175))',
            boxShadow: theme('boxShadow.xl'),
            transform: 'translateY(-2px)',
          },
        },
        
        '.btn-atlantic': {
          background: 'linear-gradient(to right, rgb(5, 150, 105), rgb(4, 120, 87))',
          color: 'white',
          fontWeight: '600',
          paddingLeft: theme('spacing.6'),
          paddingRight: theme('spacing.6'),
          paddingTop: theme('spacing.3'),
          paddingBottom: theme('spacing.3'),
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.lg'),
          transform: 'translateY(0)',
          transition: 'all 0.3s ease-out',
          '&:hover': {
            background: 'linear-gradient(to right, rgb(4, 120, 87), rgb(6, 95, 70))',
            boxShadow: theme('boxShadow.xl'),
            transform: 'translateY(-2px)',
          },
        },

        '.btn-coral': {
          background: 'linear-gradient(to right, rgb(249, 115, 22), rgb(239, 68, 68))',
          color: 'white',
          fontWeight: '600',
          paddingLeft: theme('spacing.6'),
          paddingRight: theme('spacing.6'),
          paddingTop: theme('spacing.3'),
          paddingBottom: theme('spacing.3'),
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.lg'),
          transform: 'translateY(0)',
          transition: 'all 0.3s ease-out',
          '&:hover': {
            background: 'linear-gradient(to right, rgb(234, 88, 12), rgb(220, 38, 38))',
            boxShadow: theme('boxShadow.xl'),
            transform: 'translateY(-2px)',
          },
        },

        // === CARTES ===
        '.card-ocean': {
          backgroundColor: 'white',
          borderWidth: '1px',
          borderColor: 'rgb(219, 234, 254)',
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: theme('boxShadow.ocean'),
          transform: 'translateY(0)',
          transition: 'all 0.3s ease-out',
          '&:hover': {
            boxShadow: theme('boxShadow.xl'),
            transform: 'translateY(-4px)',
          },
        },

        '.card-glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: theme('boxShadow.lg'),
          transition: 'all 0.3s ease-out',
          '&:hover': {
            boxShadow: theme('boxShadow.xl'),
          },
        },

        // === TEXTE ===
        '.text-gradient': {
          background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(5, 150, 105))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },

        '.text-hero': {
          fontSize: theme('fontSize.4xl[0]'),
          lineHeight: theme('fontSize.4xl[1].lineHeight'),
          fontWeight: '700',
          '@screen sm': {
            fontSize: theme('fontSize.5xl[0]'),
            lineHeight: theme('fontSize.5xl[1].lineHeight'),
          },
          '@screen lg': {
            fontSize: theme('fontSize.6xl[0]'),
            lineHeight: theme('fontSize.6xl[1].lineHeight'),
          },
          '@screen xl': {
            fontSize: theme('fontSize.7xl[0]'),
            lineHeight: theme('fontSize.7xl[1].lineHeight'),
          },
        },

        '.text-heading': {
          fontSize: theme('fontSize.2xl[0]'),
          lineHeight: theme('fontSize.2xl[1].lineHeight'),
          fontWeight: '700',
          '@screen sm': {
            fontSize: theme('fontSize.3xl[0]'),
            lineHeight: theme('fontSize.3xl[1].lineHeight'),
          },
          '@screen lg': {
            fontSize: theme('fontSize.4xl[0]'),
            lineHeight: theme('fontSize.4xl[1].lineHeight'),
          },
        },

        // === SCROLLBAR ===
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },

        // === ANIMATION DELAYS ===
        '.animation-delay-200': {
          animationDelay: '200ms',
        },
        '.animation-delay-400': {
          animationDelay: '400ms',
        },
        '.animation-delay-600': {
          animationDelay: '600ms',
        },
      }
      
      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}