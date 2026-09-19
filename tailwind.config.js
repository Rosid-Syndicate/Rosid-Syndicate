/** @type {import('tailwindcss').Config} */
//
// Design tokens — see DESIGN.md for the rationale behind every value.
// Semantic names (canvas, surface, ink, muted, line, accent…) are the ones new
// code should use; the legacy names (fire, ocean, electric, warm) are kept so
// existing classes keep working while components migrate.
//
// Contrast (WCAG 2.2 AA, measured):
//   ink #011E52 on canvas #F4F4F2 ............ 14.6 : 1
//   muted #475569 on canvas ................... 6.9 : 1   (slate-500 failed at 4.3)
//   white on ink (primary button) ............ 16.0 : 1
//   ink on accent #FD7B00 (accent button) ..... 6.1 : 1   (white on accent failed at 2.6)
//   accent-text #A64F00 on canvas ............. 5.1 : 1   (#FD7B00 as text failed at 2.4)
//   accent #FD7B00 on ink / deep .............. 6.1 / 7.6 : 1
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ---- semantic -----------------------------------------------------
        canvas: '#F4F4F2', // page background (light)
        surface: '#FFFFFF', // cards, panels
        deep: '#030914', // darkest background (hero base, footer)
        ink: { DEFAULT: '#011E52', muted: '#94a3b8', faint: '#475569', 700: '#0A2A6B' }, // brand navy + legacy aliases
        muted: '#475569', // body copy on light backgrounds (slate-600)
        line: '#E2E8F0', // borders / dividers on light (slate-200)
        accent: { DEFAULT: '#FD7B00', text: '#A64F00', soft: '#FFF1E6', hover: '#E66E00' },
        success: { DEFAULT: '#15803D', soft: '#DCFCE7' },
        warning: { DEFAULT: '#B45309', soft: '#FEF3C7' },
        danger: { DEFAULT: '#B91C1C', soft: '#FEE2E2' },
        info: { DEFAULT: '#0369A1', soft: '#E0F2FE' },

        // ---- legacy (kept for compatibility) -----------------------------
        warm: { 50: '#020914', 100: '#011E52', 200: '#132857' },
        fire: { DEFAULT: '#FD7B00', 50: '#fff7ed', 100: '#ffedd5', 600: '#EA580C' },
        electric: { DEFAULT: '#FF8C00' },
        ocean: { DEFAULT: '#1E3A8A', 50: '#EFF3FF', 600: '#172554' },
      },
      fontFamily: {
        sans: ['"Inter"', '"Inter Fallback"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Montserrat"', '"Montserrat Fallback"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Inter 900 / Montserrat 900 are no longer downloaded; `font-black`
      // resolves to 800 so existing markup keeps its weight without the payload.
      fontWeight: { black: '800' },
      fontSize: {
        // type scale — fluid display sizes, fixed text sizes
        display: ['clamp(2.75rem, 6vw, 4.75rem)', { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '700' }],
        h1: ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
        h2: ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.02em', fontWeight: '700' }],
        h3: ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        lead: ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.005em' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.16em', fontWeight: '700' }],
        // legacy aliases
        hero: ['clamp(3rem,7vw,5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '700' }],
        'hero-sub': ['clamp(1.125rem,1.5vw,1.35rem)', { lineHeight: '1.6', letterSpacing: '-0.01em', fontWeight: '500' }],
        section: ['clamp(2rem,4vw,3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
      },
      maxWidth: { content: '72rem', prose: '44rem' },
      spacing: { 18: '4.5rem', 22: '5.5rem', 30: '7.5rem' },
      borderRadius: { DEFAULT: '2px', sm: '2px', md: '6px' },
      boxShadow: {
        card: '0 1px 2px rgba(1, 30, 82, 0.06), 0 8px 24px -12px rgba(1, 30, 82, 0.18)',
        raised: '0 12px 32px -12px rgba(1, 30, 82, 0.28)',
      },
      backgroundImage: {
        'dots-light': 'radial-gradient(circle,rgba(11,27,66,0.05) 1px,transparent 1px)',
      },
      backgroundSize: { dots: '24px 24px' },
      transitionTimingFunction: { out: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      transitionDuration: { fast: '150ms', base: '250ms', slow: '400ms' },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        marquee: 'marquee 40s linear infinite',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0.01', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
}
