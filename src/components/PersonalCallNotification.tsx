import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, PhoneOff, Sparkles, Volume2, CheckCircle2, MessageSquare } from "lucide-react";

interface PersonalCallNotificationProps {
  onAutoPost: (title: string, content: string) => void;
  onShowToast: (text: string, type: "success" | "error" | "info") => void;
}

export function PersonalCallNotification({ onAutoPost, onShowToast }: PersonalCallNotificationProps) {
  const [show, setShow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  useEffect(() => {
    // Show alert exactly 5 seconds after mounting to simulate real-time socket delivery
    const timer = setTimeout(() => {
      setShow(true);
      // Soft procedural chime when incoming trend alert is received
      playProceduralChime();
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const playProceduralChime = () => {
    try {
      const AudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = AudioCtx.createOscillator();
      const gain = AudioCtx.createGain();
      
      osc.type = "sine";
      // Arpeggio chime
      osc.frequency.setValueAtTime(523.25, AudioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, AudioCtx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, AudioCtx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.50, AudioCtx.currentTime + 0.45); // C6

      gain.gain.setValueAtTime(0.08, AudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, AudioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(AudioCtx.destination);
      osc.start();
      osc.stop(AudioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn("AudioContext block by browser autoplay rules", e);
    }
  };

  const handlePlayVoicePreview = () => {
    if (isPlaying) return;
    setIsPlaying(true);

    try {
      const AudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = AudioCtx;

      // Play rich golden background synthesizer theme
      const mainOsc = AudioCtx.createOscillator();
      const harmonicOsc = AudioCtx.createOscillator();
      const filter = AudioCtx.createBiquadFilter();
      const gainNode = AudioCtx.createGain();

      mainOsc.type = "sawtooth";
      mainOsc.frequency.setValueAtTime(110, AudioCtx.currentTime); // Low A2 base
      mainOsc.frequency.exponentialRampToValueAtTime(220, AudioCtx.currentTime + 4);

      harmonicOsc.type = "sine";
      harmonicOsc.frequency.setValueAtTime(330, AudioCtx.currentTime); // E4 perfect fifth

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, AudioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, AudioCtx.currentTime + 3);

      gainNode.gain.setValueAtTime(0.06, AudioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, AudioCtx.currentTime + 4.5);

      mainOsc.connect(filter);
      harmonicOsc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(AudioCtx.destination);

      mainOsc.start();
      harmonicOsc.start();

      setTimeout(() => {
        setIsPlaying(false);
      }, 4500);
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  const handleApproveAndPost = () => {
    const trendTitle = "Como Instalar o Claude Code Hoje Mesmo";
    const trendContent = "🔥 AGENTES RECOLHENDO ESPAÇO: Acabamos de liberar o guia definitivo sobre como otimizar o Claude Code para programar 10x mais rápido diretamente do seu terminal doméstico. Inscreva-se ou digite CLAUDE para receber o link direto de graça. #claudecode #agentesia #nocode";
    
    onAutoPost(trendTitle, trendContent);
    onShowToast("Post gerado sob a tendência e despachado com sucesso!", "success");
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full mx-4 select-none">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="bg-zinc-950 border-2 border-[#D4AF37] rounded-2xl p-5 shadow-2xl relative overflow-hidden"
        >
          {/* Pulsing ring light */}
          <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping mt-4 mr-4" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full mt-4 mr-4" />

          <div className="flex items-start gap-3.5 relative z-10">
            <div className="p-3 bg-[#D4AF37]/15 rounded-xl border border-[#D4AF37]/40 animate-bounce shrink-0 text-[#D4AF37]">
              <Phone className="w-5 h-5" />
            </div>

            <div className="space-y-1 text-left flex-1 min-w-0">
              <span className="text-[9px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#D4AF37]/20 inline-block">
                Radar Alerta Quente
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight mt-1 truncate">
                Tendência Crítica Detectada!
              </h4>
              <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                "Claude Code & Terminal AI" subindo 320% nas últimas horas no YouTube e GitHub.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between gap-2.5">
            <button
              onClick={handlePlayVoicePreview}
              disabled={isPlaying}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-[#D4AF37]/40 font-mono text-[10px] font-bold uppercase tracking-wider py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 text-[#D4AF37] ${isPlaying ? "animate-pulse" : ""}`} />
              <span>{isPlaying ? "Ouvindo..." : "Ouvir Ideia"}</span>
            </button>

            <button
              onClick={handleApproveAndPost}
              className="flex-grow bg-[#D4AF37] hover:brightness-110 text-black font-mono text-[10px] font-black uppercase tracking-wider py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Postar Trilha</span>
            </button>

            <button
              onClick={() => setShow(false)}
              className="p-2 border border-zinc-900 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-rose-400 transition"
              title="Dispensar"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
