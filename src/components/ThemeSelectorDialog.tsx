import React from "react";
import { X, Check, Paintbrush, Sparkles } from "lucide-react";
import { APP_THEMES } from "../themeUtils";

interface ThemeSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: string;
  onSelectTheme: (themeId: "classic" | "ch3" | "uol" | "h2" | "refined_neon" | "sales_iq" | "cyber_matrix" | "forest_harmony" | "royal_velvet" | "carbon_brutalist") => void;
}

export default function ThemeSelectorDialog({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme
}: ThemeSelectorDialogProps) {
  if (!isOpen) return null;

  const themesList = Object.values(APP_THEMES);

  return (
    <div id="theme-selector-overlay" className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        id="theme-selector-container" 
        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              ThemeSelectorDialog
            </span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-5 pb-2">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5 leading-tight">
            <span>Seletor de Temas Ágeis & Modernos ERP</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Escolha uma harmonia de cores inspirada nas referências para provocar a recomposição reativa total da interface do ERP instantaneamente.
          </p>
        </div>

        {/* List of themes */}
        <div className="p-5 space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 pr-1.5">
          {themesList.map((theme) => {
            const isSelected = activeThemeId === theme.id;
            return (
              <button
                type="button"
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id as any);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs" 
                    : "border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-900/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Swatches circle group */}
                  <div className="flex -space-x-1.5 shrink-0 mt-0.5">
                    <span 
                      className="w-4 h-4 rounded-full border border-white dark:border-zinc-900 shadow-3xs" 
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span 
                      className="w-4 h-4 rounded-full border border-white dark:border-zinc-900 shadow-3xs" 
                      style={{ backgroundColor: theme.secondary }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                        {theme.name}
                      </span>
                      <span className="text-[8px] font-mono font-bold bg-zinc-100 dark:bg-zinc-850 text-zinc-500 dark:text-zinc-405 px-1.5 py-0.2 rounded border border-zinc-200 dark:border-zinc-805">
                        {theme.brandName}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-0.5 leading-normal">
                      Tema com as paletas visual {theme.name}. Ajusta dinamicamente cores e botões.
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-905 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold text-[10.5px] px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Confirmar Estilo
          </button>
        </div>
      </div>
    </div>
  );
}
