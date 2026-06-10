import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface VerifiedBadgeProps {
  show: boolean;
  score: number;
  onComplete: () => void;
}

export function VerifiedBadge({ show, score, onComplete }: VerifiedBadgeProps) {
  const isPremium = score >= 85;

  useEffect(() => {
    if (show && isPremium) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, isPremium, onComplete]);

  if (!show || !isPremium) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: -20 }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/75 backdrop-blur-md select-none"
      >
        <motion.div 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-br from-[#0A0A0A] to-[#141414] rounded-2xl p-8 shadow-2xl border-2 border-[#D4AF37] max-w-sm w-full mx-4 text-center relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-10 bg-[#D4AF37]/10 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex flex-col items-center space-y-4 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/30 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-[#141414] border border-[#D4AF37]/60 flex items-center justify-center text-center relative">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="2.5"
                  className="animate-pulse"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-[#D4AF37] font-sans font-bold text-xl tracking-wider uppercase">
                Verificado por Tom
              </h3>
              <p className="text-zinc-400 text-xs font-sans tracking-wide">
                ESTRUTURA DE AUDITORIA EDITORIAL
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 font-mono text-center">
              <span className="text-[10px] text-zinc-500 uppercase block tracking-widest">
                Índice de Conformidade
              </span>
              <span className="text-2xl font-black text-white">{score}%</span>
            </div>

            <p className="text-zinc-350 text-xs italic font-sans max-w-xs">
              "Conteúdo alinhado com as diretrizes premium e pronto para distribuição orgânica maximizada."
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
