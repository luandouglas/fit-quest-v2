/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./shared/**/*.{ts,tsx,js,jsx}",
    "./ui/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],         // 11px / 14px
        'caption': ['0.75rem', { lineHeight: '1rem' }],           // 12px / 16px
        'description': ['0.8125rem', { lineHeight: '1.125rem' }],   // 13px / 18px
        'body': ['0.875rem', { lineHeight: '1.25rem' }],          // 14px / 20px
        'button': ['0.875rem', { lineHeight: '1.25rem' }],        // 14px / 20px
        'label': ['0.8125rem', { lineHeight: '1.125rem' }],       // 13px / 18px
        'card-title': ['0.9375rem', { lineHeight: '1.25rem' }],  // 15px / 20px
        'section-title': ['1rem', { lineHeight: '1.375rem' }],    // 16px / 22px
        'subtitle': ['1rem', { lineHeight: '1.375rem' }],         // 16px / 22px
        'screen-title': ['1.125rem', { lineHeight: '1.5rem' }],   // 18px / 24px
        'highlight': ['1.125rem', { lineHeight: '1.5rem' }],      // 18px / 24px
        'display': ['1.125rem', { lineHeight: '1.5rem' }],        // 18px / 24px
      },
      letterSpacing: {
        'caps': '0.14em',
        'caps-wide': '0.16em',
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        '2xl': "calc(var(--radius) + 8px)",
        '3xl': "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        'soft': '0 1px 3px rgb(var(--shadow-neutral-rgb) / 0.08)',
        'card': '0 10px 30px -18px rgb(var(--shadow-neutral-rgb) / 0.18)',
        'elevated': '0 18px 40px -22px rgb(var(--shadow-neutral-rgb) / 0.22)',
        'float': '0 24px 48px -24px rgb(var(--shadow-neutral-rgb) / 0.26)',
        'overlay': '0 28px 60px -26px rgb(var(--shadow-neutral-rgb) / 0.30)',
        'deep': '0 36px 80px -32px rgb(var(--shadow-neutral-rgb) / 0.36)',
        'dramatic': '0 32px 90px -30px rgb(var(--shadow-neutral-rgb) / 0.45)',
        'btn-primary': '0 14px 28px -18px rgb(var(--shadow-primary-rgb) / 0.55)',
        'btn-secondary': '0 14px 28px -18px rgb(var(--shadow-secondary-rgb) / 0.48)',
        'btn-success': '0 14px 28px -18px rgb(var(--shadow-success-rgb) / 0.48)',
        'btn-warning': '0 14px 28px -18px rgb(var(--shadow-warning-rgb) / 0.48)',
        'btn-danger': '0 14px 28px -18px rgb(var(--shadow-danger-rgb) / 0.48)',
        'btn-neutral': '0 12px 24px -18px rgb(var(--shadow-neutral-rgb) / 0.4)',
        'btn-outline': '0 8px 18px -16px rgb(var(--shadow-neutral-rgb) / 0.22)',
        'glow-primary': '0 0 0 1px rgb(var(--shadow-primary-rgb) / 0.18), 0 0 24px rgb(var(--shadow-primary-rgb) / 0.22)',
        'glow-secondary': '0 0 0 1px rgb(var(--shadow-secondary-rgb) / 0.18), 0 0 24px rgb(var(--shadow-secondary-rgb) / 0.22)',
        'glow-success': '0 0 0 1px rgb(var(--shadow-success-rgb) / 0.18), 0 0 24px rgb(var(--shadow-success-rgb) / 0.22)',
        'glow-danger': '0 0 0 1px rgb(var(--shadow-danger-rgb) / 0.18), 0 0 24px rgb(var(--shadow-danger-rgb) / 0.22)',
        'inset-highlight': 'inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        'inset-soft': 'inset 0 1px 2px rgb(var(--shadow-neutral-rgb) / 0.12)',
        'badge': '0 8px 18px -14px rgb(var(--shadow-neutral-rgb) / 0.18)',
        'ring-focus': '0 0 0 3px rgb(var(--shadow-primary-rgb) / 0.18)',
        'ring-primary': '0 0 0 1px rgb(var(--shadow-primary-rgb) / 0.35)',
      },
      maxWidth: {
        'modal': 'min(560px, 92vw)',
        'modal-lg': 'min(740px, 94vw)',
        'modal-xl': 'min(920px, 92vw)',
        'toast': 'min(360px, 92vw)',
        'drawer': 'min(420px, 88vw)',
        'popover': 'min(460px, 100%)',
        'popover-lg': 'min(580px, 100%)',
        'chat-bubble': '84%',
        'prose-xs': '11ch',
      },
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'interactive': 'transform, box-shadow, border-color, background-color',
      },
      zIndex: {
        'modal': '60',
        'dropdown': '80',
        'tooltip': '80',
        'toast': '90',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        tertiary: {
          DEFAULT: "var(--tertiary)",
          foreground: "var(--tertiary-foreground)",
        },
        gamification: {
          DEFAULT: "var(--gamification)",
          foreground: "var(--gamification-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        star: {
          DEFAULT: "var(--star)",
          foreground: "var(--star-foreground)",
        },
        surface: {
          subtle: "var(--surface-subtle)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
