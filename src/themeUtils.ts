export interface AppTheme {
  id: "classic" | "ch3" | "uol" | "h2" | "refined_neon" | "sales_iq" | "cyber_matrix" | "forest_harmony" | "royal_velvet" | "carbon_brutalist";
  name: string;
  brandName: string;
  primary: string;       // Primary color hex
  secondary: string;     // Accent color hex
  bgPage: string;        // CSS/Tailwind friendly bg-page
  bgCard: string;        // CSS/Tailwind friendly bg-card
  textColor: string;     // CSS/Tailwind text-color
  textMuted: string;     // Muted text color hex or tailwind
  borderColor: string;   // Border style
  accentBadge: string;   // Badge bg
  accentText: string;    // Accent text class
  sidebarBg: string;     // Sidebar styles
}

export const APP_THEMES: Record<string, AppTheme> = {
  classic: {
    id: "classic",
    name: "Oliveira Clássico",
    brandName: "ETHECNC CLASSIC",
    primary: "#556b2f", // olive green
    secondary: "#8b7355", // bronze-taupe
    bgPage: "bg-[#fbfaf5]", // rustic cream
    bgCard: "bg-white",
    textColor: "text-zinc-850",
    textMuted: "text-zinc-500",
    borderColor: "border-[#e6e2d8]",
    accentBadge: "bg-[#f5ebd6] text-[#8b7355]",
    accentText: "text-[#556b2f]",
    sidebarBg: "bg-[#2d3a1e] text-[#fdfcf7]"
  },
  ch3: {
    id: "ch3",
    name: "Open Studio Ouro Negro",
    brandName: "OPEN STUDIO",
    primary: "#D4AF37", // rich gold
    secondary: "#0A0A0A", // deep black
    bgPage: "bg-[#0A0A0A]", // Pitch black background
    bgCard: "bg-[#141414] border border-[#D4AF37]/25", // Obsidian gold-shadowed card
    textColor: "text-white",
    textMuted: "text-zinc-400",
    borderColor: "border-zinc-800",
    accentBadge: "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30",
    accentText: "text-[#D4AF37]",
    sidebarBg: "bg-black border-r border-[#D4AF37]/20 text-[#D4AF37]"
  },
  uol: {
    id: "uol",
    name: "UOL Orquídea Digital",
    brandName: "UOL HOST PRO",
    primary: "#db2777", // magenta / orchid
    secondary: "#ec4899", // pink strawberry
    bgPage: "bg-[#faf5f8]", // soft lavender-cream
    bgCard: "bg-white",
    textColor: "text-zinc-900",
    textMuted: "text-zinc-500",
    borderColor: "border-pink-100",
    accentBadge: "bg-pink-50 text-pink-700",
    accentText: "text-pink-600",
    sidebarBg: "bg-[#2d0619] text-pink-50"
  },
  h2: {
    id: "h2",
    name: "H2 Azul Técnico",
    brandName: "H2 SERVICE",
    primary: "#0284c7", // electric blue
    secondary: "#475569", // anodized steel
    bgPage: "bg-[#f0f9ff]", // arctic blue ice
    bgCard: "bg-white",
    textColor: "text-zinc-805",
    textMuted: "text-zinc-500",
    borderColor: "border-sky-100",
    accentBadge: "bg-sky-50 text-sky-700",
    accentText: "text-sky-600",
    sidebarBg: "bg-[#0c4a6e] text-sky-50"
  },
  refined_neon: {
    id: "refined_neon",
    name: "Refinado & Moderno Gradient",
    brandName: "PAINEL NEON",
    primary: "#c084fc", // purple orchid glow
    secondary: "#ec4899", // strawberry pink
    bgPage: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50", 
    bgCard: "bg-white/90 backdrop-blur-md",
    textColor: "text-indigo-950",
    textMuted: "text-indigo-600/80",
    borderColor: "border-purple-100",
    accentBadge: "bg-indigo-100 text-indigo-700",
    accentText: "text-purple-650",
    sidebarBg: "bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-purple-100"
  },
  sales_iq: {
    id: "sales_iq",
    name: "SalesIQ Executivo",
    brandName: "SALESIQ DRIB",
    primary: "#3b82f6", // clear dynamic blue
    secondary: "#64748b", // slate gray
    bgPage: "bg-[#e2e8f0]", // soft satin gray
    bgCard: "bg-white",
    textColor: "text-[#1e293b]",
    textMuted: "text-slate-500",
    borderColor: "border-slate-205",
    accentBadge: "bg-blue-50 text-blue-700",
    accentText: "text-blue-600",
    sidebarBg: "bg-[#0f172a] text-slate-100"
  },
  cyber_matrix: {
    id: "cyber_matrix",
    name: "Cyber Matrix Neo",
    brandName: "MATRIX NET",
    primary: "#22c55e", // glowing green
    secondary: "#10b981", // glowing emerald
    bgPage: "bg-black",
    bgCard: "bg-[#09090b] border border-green-900/30",
    textColor: "text-green-400",
    textMuted: "text-green-600/80",
    borderColor: "border-green-900/30",
    accentBadge: "bg-green-950/50 text-green-300 border border-green-800/30",
    accentText: "text-green-500",
    sidebarBg: "bg-zinc-950 border-r border-green-900/20 text-green-450"
  },
  forest_harmony: {
    id: "forest_harmony",
    name: "Verde Floresta Orgânico",
    brandName: "FOREST WELL",
    primary: "#059669", // emerald medium
    secondary: "#15803d", // forest deep
    bgPage: "bg-[#f0fdf4]", // light soft mint
    bgCard: "bg-white",
    textColor: "text-[#14532d]",
    textMuted: "text-[#166534]/75",
    borderColor: "border-[#bbf7d0]",
    accentBadge: "bg-[#dcfce7] text-[#15803d]",
    accentText: "text-[#047857]",
    sidebarBg: "bg-[#064e3b] text-[#f0fdf4]"
  },
  royal_velvet: {
    id: "royal_velvet",
    name: "Royal Velvet Púrpura",
    brandName: "VELVET LUXURY",
    primary: "#7c3aed", // royal violet
    secondary: "#c084fc", // soft orchid
    bgPage: "bg-[#faf5ff]", // soft lilac silk
    bgCard: "bg-white",
    textColor: "text-[#3b0764]",
    textMuted: "text-[#5b21b6]/70",
    borderColor: "border-[#e9d5ff]",
    accentBadge: "bg-[#f3e8ff] text-[#6d28d9]",
    accentText: "text-[#7c3aed]",
    sidebarBg: "bg-[#1e1b4b] text-purple-100"
  },
  carbon_brutalist: {
    id: "carbon_brutalist",
    name: "Carbono Brutalista",
    brandName: "CARBONO MONO",
    primary: "#f59e0b", // amber warning
    secondary: "#f4f4f5", // zinc high contrast
    bgPage: "bg-[#18181b]", // deep charcoal carbon
    bgCard: "bg-[#27272a] border border-[#3f3f46]",
    textColor: "text-[#f4f4f5]",
    textMuted: "text-[#a1a1aa]",
    borderColor: "border-[#3f3f46]",
    accentBadge: "bg-[#3f3f46] text-[#fbbf24]",
    accentText: "text-amber-500",
    sidebarBg: "bg-black border-r border-zinc-800 text-zinc-100"
  }
};

export function getThemeStyles(themeId: string, isDark: boolean = false) {
  const baseTheme = APP_THEMES[themeId] || APP_THEMES.classic;
  
  if (isDark) {
    if (themeId === "cyber_matrix" || themeId === "carbon_brutalist" || themeId === "ch3") {
      return baseTheme;
    }
    return {
      ...baseTheme,
      bgPage: "bg-[#0c0d0f]",
      bgCard: "bg-[#15171a]",
      textColor: "text-zinc-100",
      textMuted: "text-zinc-400",
      borderColor: "border-[#222428]",
      accentBadge: "bg-[#23211b] text-amber-200"
    };
  }
  
  return baseTheme;
}
