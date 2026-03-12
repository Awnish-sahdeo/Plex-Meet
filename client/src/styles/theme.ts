export const theme = {
  colors: {
    bg: "#0F172A",
    bgElevated: "#1E293B",
    tile: "#111827",
    surface: "#1F2937",
    surfaceHover: "#374151",
    border: "#374151",
    borderFocus: "#3B82F6",
    primary: "#3B82F6",
    primaryHover: "#2563EB",
    secondary: "#6366F1",
    danger: "#EF4444",
    dangerHover: "#DC2626",
    success: "#22C55E",
    warning: "#F59E0B",
    text: "#E5E7EB",
    textMuted: "#9CA3AF",
    textDim: "#6B7280",
  },
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  font: {
    sans: "'Inter', -apple-system, system-ui, sans-serif",
    mono: "'Roboto Mono', monospace",
  },
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.5)",
    md: "0 4px 16px rgba(0,0,0,0.6)",
    lg: "0 8px 32px rgba(0,0,0,0.7)",
    glow: "0 0 20px rgba(59,130,246,0.4)",
    glowGreen: "0 0 20px rgba(34,197,94,0.5)",
  },
} as const;

export type Theme = typeof theme;
