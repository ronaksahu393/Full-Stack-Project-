/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          midnight: "#0A1628",
          navy: "#0D1F3C",
          navyDeep: "#071020",
          forest: "#0F3024",
          gold: "#D4AF6B",
          goldLight: "#E8C98A",
          goldDark: "#B8924A",
          amber: "#E8A04A",
          ivory: "#FAF8F3",
          cream: "#F0EDE6",
          white: "#FFFFFF",
          charcoal: "#1A1C1E",
          muted: "#8A9BAE",
          border: "#1E2D47",
          borderLight: "#2A3F5F",
          success: "#2ECC89",
          warning: "#E8A04A",
          error: "#E05252",
          emerald: "#00C98D"
        }
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["'Inter'", "'DM Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      },
      boxShadow: {
        subtle: "0 1px 4px rgba(0,0,0,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.3)",
        elevated: "0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,107,0.1)",
        gold: "0 8px 32px rgba(212,175,107,0.25)",
        modal: "0 32px 64px rgba(0,0,0,0.6)",
        glass: "0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)"
      },
      letterSpacing: {
        eyebrow: ".22em",
        editorial: ".14em",
        widest2: ".28em"
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF6B 0%, #B8924A 100%)",
        "midnight-gradient": "linear-gradient(180deg, #0A1628 0%, #071020 100%)",
        "hero-gradient": "linear-gradient(135deg, #0A1628 0%, #0D1F3C 30%, #0F2A1E 70%, #0A1628 100%)"
      }
    },
  },
  plugins: [],
}
