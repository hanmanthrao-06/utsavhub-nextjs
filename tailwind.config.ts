import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["Playfair Display", "Georgia", "serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        pastel: {
          lavender: "#F0D9EF",
          pink:     "#FCDCE1",
          yellow:   "#FFE6BB",
          green:    "#E9ECCE",
          mint:     "#CDE9DC",
          blue:     "#C4DFE5",
        },
      },
      animation: {
        "fade-in":       "fadeIn 0.5s ease both",
        "fade-in-up":    "fadeInUp 0.5s cubic-bezier(.22,1,.36,1) both",
        "fade-in-down":  "fadeInDown 0.5s ease both",
        "fade-in-left":  "fadeInLeft 0.5s ease both",
        "fade-in-right": "fadeInRight 0.5s ease both",
        "float":         "float 8s ease-in-out infinite",
        "pulse-glow":    "pulse-glow 2s ease-in-out infinite",
        "bounce-in":     "bounce-in 0.6s cubic-bezier(.22,1,.36,1) both",
        "slide-up":      "slide-up 0.4s cubic-bezier(.22,1,.36,1) both",
        "rotate-in":     "rotate-in 0.5s ease both",
        "gradient-x":    "gradient-x 4s ease infinite",
        "spin-slow":     "spin-slow 8s linear infinite",
        "morph":         "morph 8s ease-in-out infinite",
        "shimmer":       "shimmer 3s linear infinite",
      },
      keyframes: {
        fadeIn:      { from: { opacity:"0" },                               to: { opacity:"1" } },
        fadeInUp:    { from: { opacity:"0", transform:"translateY(28px)" },  to: { opacity:"1", transform:"translateY(0)" } },
        fadeInDown:  { from: { opacity:"0", transform:"translateY(-24px)" }, to: { opacity:"1", transform:"translateY(0)" } },
        fadeInLeft:  { from: { opacity:"0", transform:"translateX(-24px)" }, to: { opacity:"1", transform:"translateX(0)" } },
        fadeInRight: { from: { opacity:"0", transform:"translateX(24px)" },  to: { opacity:"1", transform:"translateX(0)" } },
        float:       { "0%,100%": { transform:"translateY(0) rotate(0deg)" }, "50%": { transform:"translateY(-20px) rotate(3deg)" } },
        "pulse-glow":{ "0%,100%": { boxShadow:"0 0 0 0 rgba(155,106,170,0.4)" }, "50%": { boxShadow:"0 0 0 12px rgba(155,106,170,0)" } },
        "bounce-in": { "0%": { opacity:"0", transform:"scale(0.3)" }, "50%": { transform:"scale(1.05)" }, "70%": { transform:"scale(0.9)" }, "100%": { opacity:"1", transform:"scale(1)" } },
        "slide-up":  { from: { opacity:"0", transform:"translateY(100%)" }, to: { opacity:"1", transform:"translateY(0)" } },
        "rotate-in": { from: { opacity:"0", transform:"rotate(-10deg) scale(0.9)" }, to: { opacity:"1", transform:"rotate(0) scale(1)" } },
        "gradient-x":{ "0%,100%": { backgroundPosition:"0% 50%" }, "50%": { backgroundPosition:"100% 50%" } },
        "spin-slow":  { from: { transform:"rotate(0deg)" }, to: { transform:"rotate(360deg)" } },
        morph:       { "0%,100%": { borderRadius:"60% 40% 30% 70%/60% 30% 70% 40%" }, "50%": { borderRadius:"30% 60% 70% 40%/50% 60% 30% 60%" } },
        shimmer:     { "0%": { backgroundPosition:"-200% center" }, "100%": { backgroundPosition:"200% center" } },
      },
    },
  },
  plugins: [],
};

export default config;
