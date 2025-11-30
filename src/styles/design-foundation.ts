/**
 * ============================================================================
 * LONG SANG DESIGN FOUNDATION
 * ============================================================================
 *
 * Single Source of Truth cho toàn bộ design system.
 * Mọi component, page mới PHẢI sử dụng các giá trị từ file này.
 *
 * THEME: Dark Tech Professional
 * - Tone: Xanh dương đậm (Deep Blue)
 * - Style: Công nghệ, Chuyên nghiệp, Hiện đại
 * - Contrast: Nền tối, chữ sáng
 *
 * ============================================================================
 * COLOR PALETTE (Chỉ 5 màu chính + variations)
 * ============================================================================
 *
 * 1. BACKGROUND (Nền)
 *    - Primary: #0a0f1a (Deep Navy) - Nền chính
 *    - Secondary: #111827 (Dark Slate) - Cards, surfaces
 *    - Tertiary: #1e293b (Slate) - Borders, dividers
 *
 * 2. PRIMARY (Xanh dương chính)
 *    - Main: #3b82f6 (Blue 500) - CTAs, links, highlights
 *    - Light: #60a5fa (Blue 400) - Hover states
 *    - Dark: #2563eb (Blue 600) - Active states
 *
 * 3. ACCENT (Cyan - điểm nhấn)
 *    - Main: #06b6d4 (Cyan 500) - Secondary highlights
 *    - Light: #22d3ee (Cyan 400) - Glow effects
 *
 * 4. TEXT (Chữ)
 *    - Primary: #f8fafc (Slate 50) - Tiêu đề, text chính
 *    - Secondary: #94a3b8 (Slate 400) - Text phụ, descriptions
 *    - Muted: #64748b (Slate 500) - Placeholders, disabled
 *
 * 5. SEMANTIC (Ngữ nghĩa)
 *    - Success: #10b981 (Emerald 500)
 *    - Warning: #f59e0b (Amber 500)
 *    - Error: #ef4444 (Red 500)
 *
 * ============================================================================
 */

// ============================================================================
// CSS VARIABLES (Copy vào index.css)
// ============================================================================
export const CSS_VARIABLES = `
:root {
  /* ========================================
   * FOUNDATION COLORS - Deep Blue Theme
   * ======================================== */

  /* Background Scale (Nền) */
  --ls-bg-primary: 220 30% 6%;      /* #0a0f1a - Nền chính */
  --ls-bg-secondary: 220 25% 10%;   /* #111827 - Cards */
  --ls-bg-tertiary: 215 20% 16%;    /* #1e293b - Elevated surfaces */
  --ls-bg-elevated: 215 18% 20%;    /* #283548 - Modals, dropdowns */

  /* Primary Blue (Màu chính) */
  --ls-primary: 217 91% 60%;        /* #3b82f6 */
  --ls-primary-light: 213 94% 68%;  /* #60a5fa */
  --ls-primary-dark: 221 83% 53%;   /* #2563eb */
  --ls-primary-glow: 217 91% 60% / 0.3;

  /* Accent Cyan (Điểm nhấn) */
  --ls-accent: 187 85% 43%;         /* #06b6d4 */
  --ls-accent-light: 185 84% 53%;   /* #22d3ee */
  --ls-accent-glow: 187 85% 43% / 0.25;

  /* Text Scale (Chữ) */
  --ls-text-primary: 210 40% 98%;   /* #f8fafc - Tiêu đề */
  --ls-text-secondary: 214 32% 91%; /* #e2e8f0 - Mô tả (sáng hơn nữa) */
  --ls-text-muted: 214 32% 81%;     /* #cbd5e1 - Placeholder (sáng hơn) */
  --ls-text-inverse: 220 30% 6%;    /* #0a0f1a - Text trên nền sáng */

  /* Border & Divider */
  --ls-border: 215 20% 22%;         /* #2d3a4f */
  --ls-border-light: 215 18% 28%;   /* #3d4a5f */
  --ls-divider: 215 20% 18%;        /* #242f3f */

  /* Semantic Colors */
  --ls-success: 160 84% 39%;        /* #10b981 */
  --ls-warning: 38 92% 50%;         /* #f59e0b */
  --ls-error: 0 84% 60%;            /* #ef4444 */
  --ls-info: 217 91% 60%;           /* #3b82f6 (same as primary) */

  /* Glass Effect */
  --ls-glass-bg: 220 25% 10% / 0.8;
  --ls-glass-border: 215 20% 30% / 0.5;

  /* Shadows */
  --ls-shadow-sm: 0 2px 8px hsl(220 30% 4% / 0.3);
  --ls-shadow-md: 0 4px 16px hsl(220 30% 4% / 0.4);
  --ls-shadow-lg: 0 8px 32px hsl(220 30% 4% / 0.5);
  --ls-shadow-glow: 0 0 20px hsl(var(--ls-primary-glow));
}
`;

// ============================================================================
// TAILWIND COLOR TOKENS (Sử dụng trong components)
// ============================================================================
export const colors = {
  // Background
  bg: {
    primary: "bg-[#0a0f1a]",
    secondary: "bg-[#111827]",
    tertiary: "bg-[#1e293b]",
    elevated: "bg-[#283548]",
  },

  // Primary Blue
  primary: {
    DEFAULT: "text-blue-500", // #3b82f6
    light: "text-blue-400", // #60a5fa
    dark: "text-blue-600", // #2563eb
    bg: "bg-blue-500",
    bgLight: "bg-blue-400",
    bgDark: "bg-blue-600",
    border: "border-blue-500",
    hover: "hover:bg-blue-400",
  },

  // Accent Cyan
  accent: {
    DEFAULT: "text-cyan-500", // #06b6d4
    light: "text-cyan-400", // #22d3ee
    bg: "bg-cyan-500",
    border: "border-cyan-500",
  },

  // Text
  text: {
    primary: "text-slate-50", // #f8fafc
    secondary: "text-slate-400", // #94a3b8
    muted: "text-slate-500", // #64748b
  },

  // Border
  border: {
    DEFAULT: "border-slate-700", // #334155
    light: "border-slate-600", // #475569
  },

  // Semantic
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
} as const;

// ============================================================================
// GRADIENT PRESETS (Chỉ dùng 2-3 gradients nhất quán)
// ============================================================================
export const gradients = {
  // Primary gradient - cho CTAs, buttons chính
  primary: "bg-gradient-to-r from-blue-600 to-blue-500",
  primaryHover: "hover:from-blue-500 hover:to-blue-400",

  // Accent gradient - cho highlights, badges
  accent: "bg-gradient-to-r from-blue-500 to-cyan-500",

  // Subtle gradient - cho cards, surfaces
  surface: "bg-gradient-to-br from-slate-900/50 to-slate-800/30",

  // Text gradient - cho headings đặc biệt
  text: "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent",

  // Glow effect
  glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
  glowStrong: "shadow-[0_0_40px_rgba(59,130,246,0.4)]",
} as const;

// ============================================================================
// COMPONENT STYLES (Copy-paste ready)
// ============================================================================
export const componentStyles = {
  // Card styles
  card: {
    base: "bg-[#111827] border border-slate-700/50 rounded-xl",
    hover:
      "hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300",
    glass: "bg-slate-900/50 backdrop-blur-xl border border-slate-700/30",
  },

  // Button styles
  button: {
    primary:
      "bg-blue-500 hover:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-lg transition-colors",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-6 py-2.5 rounded-lg transition-colors",
    ghost: "hover:bg-slate-800/50 text-slate-300 px-4 py-2 rounded-lg transition-colors",
    accent:
      "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-medium px-6 py-2.5 rounded-lg transition-all",
  },

  // Input styles
  input: {
    base: "bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-colors",
  },

  // Badge styles
  badge: {
    primary:
      "bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-sm",
    accent: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-sm",
    success:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-sm",
  },

  // Section styles
  section: {
    base: "py-20 px-4",
    container: "max-w-7xl mx-auto",
  },

  // Typography
  heading: {
    h1: "text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50",
    h2: "text-3xl md:text-4xl font-bold text-slate-50",
    h3: "text-xl md:text-2xl font-semibold text-slate-50",
    subtitle: "text-lg text-slate-400",
  },
} as const;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
/*

// 1. Import và sử dụng trong component:
import { colors, gradients, componentStyles } from '@/styles/design-foundation';

// Card example
<div className={componentStyles.card.base}>
  <h3 className={componentStyles.heading.h3}>Title</h3>
  <p className={colors.text.secondary}>Description</p>
</div>

// Button example
<button className={componentStyles.button.primary}>
  Get Started
</button>

// Gradient text example
<h1 className={gradients.text}>
  Long Sang Automation
</h1>

// 2. Hoặc dùng trực tiếp Tailwind classes theo guide:

// Background: bg-[#0a0f1a], bg-[#111827], bg-[#1e293b]
// Primary: text-blue-500, bg-blue-500, border-blue-500
// Accent: text-cyan-500, bg-cyan-500
// Text: text-slate-50, text-slate-400, text-slate-500
// Border: border-slate-700, border-slate-600

*/

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type ColorToken = keyof typeof colors;
export type GradientToken = keyof typeof gradients;
export type ComponentStyleToken = keyof typeof componentStyles;
