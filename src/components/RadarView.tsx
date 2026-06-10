import { useState } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  Compass, 
  CheckCircle, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  Youtube,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Globe,
  Radio
} from "lucide-react";
import { AppState, RadarTopicSuggestion } from "../types";

interface RadarViewProps {
  state: AppState;
  onAnalyzeRadar: () => Promise<void>;
  onSelectSuggestedTopic: (topic: string, channel: string, keyword: string) => void;
}

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.84 2.19 1.4 3.48 1.62V9.7c-1.39-.17-2.73-.75-3.82-1.63-.09-.07-.15-.19-.18-.3-.02 1.49-.01 2.99-.02 4.48-.06 2.05-.62 4.12-1.8 5.75-1.52 2.21-4.04 3.65-6.73 3.84-2.58.26-5.28-.6-7.14-2.42C-.17 17.51-1.07 14.15-.4 10.97c.52-2.77 2.45-5.22 5.09-6.32 1.42-.64 2.99-.9 4.54-.79V7.8c-1.12-.17-2.29-.02-3.32.48-1.54.71-2.61 2.24-2.8 3.92-.3 2.13.78 4.31 2.69 5.3 1.54.89 3.49.91 5.04.09.91-.45 1.63-1.22 1.96-2.15.22-.52.28-1.1.28-1.66V0h.03z"/>
  </svg>
);

export default function RadarView({ state, onAnalyzeRadar, onSelectSuggestedTopic }: RadarViewProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAnalyzeClick = async () => {
    setAnalyzing(true);
    try {
      await onAnalyzeRadar();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="w-4 h-4 text-[#0A66C2]" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-[#E1306C]" />;
      case "facebook":
        return <Facebook className="w-4 h-4 text-[#1877F2]" />;
      case "tiktok":
        return <TiktokIcon className="w-4 h-4 text-zinc-900" />;
      case "youtube":
        return <Youtube className="w-4 h-4 text-[#FF0000]" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return { bg: "bg-blue-50 text-blue-700 border-blue-100", accent: "border-l-4 border-l-[#0A66C2]" };
      case "instagram":
        return { bg: "bg-pink-50 text-pink-700 border-pink-100", accent: "border-l-4 border-l-[#E1306C]" };
      case "facebook":
        return { bg: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20", accent: "border-l-4 border-l-[#1877F2]" };
      case "tiktok":
        return { bg: "bg-zinc-100 text-zinc-800 border-zinc-200", accent: "border-l-4 border-l-zinc-900" };
      case "youtube":
        return { bg: "bg-red-50 text-red-700 border-red-100", accent: "border-l-4 border-l-[#FF0000]" };
      default:
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-110", accent: "border-l-4 border-l-emerald-500" };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in mb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-150 pb-6">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
            VIGILÂNCIA DE MERCADO · INTELIGÊNCIA ARTIFICIAL
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mt-1">
            Radar de Tendências
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Monitore canais do X, YouTube e GitHub, e gere tópicos otimizados de postagens sob medida com o Gemini 3.5.
          </p>
        </div>

        <div>
          <button
            onClick={handleAnalyzeClick}
            disabled={analyzing}
            className="group flex items-center gap-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white shadow-sm font-semibold text-sm px-5 py-3 rounded-xl transition-all"
          >
            {analyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            )}
            <span>{analyzing ? "Analisando com IA..." : "Analisar com Gemini IA"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Insights on Left/Main, Raw Sinais on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Suggested topics / AI analysis (Takes 2 columns if loaded, or placeholder) */}
        <div className="lg:col-span-2 space-y-6">
          {state.radarAnalysis ? (
            <div className="space-y-6">
              {/* IA Summary Banner */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 shadow-sm border border-zinc-850 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-rose-600/15 rounded-full blur-[30px] translate-x-10 -translate-y-10"></div>
                <div className="flex items-center gap-2 text-[10px] text-rose-400 font-mono font-bold tracking-wider uppercase mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  SÍNTESE INTELIGENTE GENERATIVA
                </div>
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight mb-2">Visão Geral das Tendências</h2>
                <p className="text-zinc-300 text-sm leading-relaxed font-normal">
                  {state.radarAnalysis.summary}
                </p>
                <div className="border-t border-zinc-700/55 pt-4 mt-4 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Sinais analisados: {state.radar.length}</span>
                  <span>Última análise: {new Date(state.radarAnalysis.analyzedAt).toLocaleDateString("pt-BR")} às {new Date(state.radarAnalysis.analyzedAt).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"})}</span>
                </div>
              </div>

              {/* Key Insights List */}
              <div className="bg-white border border-zinc-150 p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-zinc-800 tracking-tight uppercase font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Gatilhos de Engajamento e Descobertas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {state.radarAnalysis.keyInsights.map((insight, index) => (
                    <div key={index} className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl flex flex-col justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-400">#0{index + 1}</span>
                      <p className="text-xs font-semibold text-zinc-700 mt-2 leading-relaxed">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions Section Header */}
              <div className="pt-2">
                <h3 className="text-md font-bold text-zinc-900 tracking-tight flex items-center gap-1.5">
                  <Compass className="w-5 h-5 text-rose-500" />
                  Tópicos Otimizados para Postagens
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Clique em "Transferir para Geração" para gerar a copy final do post imediatamente utilizando o tema.</p>
              </div>

              {/* Suggested platforms list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {state.radarAnalysis.suggestions.map((suggestion, index) => {
                  const style = getPlatformStyle(suggestion.platform);
                  const isCopied = copiedId === `sug_${index}`;

                  return (
                    <div 
                      key={index} 
                      className={`bg-white border border-zinc-150 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-72 ${style.accent}`}
                    >
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${style.bg} flex items-center gap-1`}>
                            {getPlatformIcon(suggestion.platform)}
                            {suggestion.platform}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                            Isca: #{suggestion.keyword}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-zinc-800 leading-snug tracking-tight text-left min-h-12 line-clamp-2">
                          {suggestion.title}
                        </h4>

                        <div className="space-y-1 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                          <span className="text-[9px] font-bold font-mono text-zinc-400 block uppercase">Angulação / Gancho</span>
                          <p className="text-[11px] text-zinc-600 leading-relaxed text-left line-clamp-3">
                            {suggestion.angle}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="border-t border-zinc-100 bg-zinc-50/50 p-3 flex items-center justify-between rounded-b-xl gap-2">
                        <span className="text-[10px] font-medium text-zinc-500 truncate">
                          {suggestion.suggestedFormat}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(`Título: ${suggestion.title}\n\nÂngulo: ${suggestion.angle}\n\nFormato: ${suggestion.suggestedFormat}`, `sug_${index}`)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-600 bg-white rounded-lg border border-zinc-150 hover:bg-zinc-50"
                            title="Copiar rascunho"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => onSelectSuggestedTopic(suggestion.title, suggestion.platform, suggestion.keyword)}
                            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <span>Utilizar Tema</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* Analysis Placeholder Dashboard */
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-6 min-h-110">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 relative">
                <Sparkles className="w-7 h-7" />
                <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping opacity-60"></div>
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Análise Inteligente Indisponível</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Combine todos os sinais de monitoramento compilados de feeds do X, trending repos de GitHub e vídeos do YouTube para criar postagens perfeitas de alta viralidade.
                </p>
              </div>
              <button
                onClick={handleAnalyzeClick}
                disabled={analyzing}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white shadow-sm font-semibold text-sm px-6 py-3 rounded-xl transition"
              >
                {analyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{analyzing ? "Processando canais de dados..." : "Extrair Tendências com o Gemini"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Signals Column (Right side, takes 1 column) */}
        <div className="space-y-5">
          <div className="bg-white border border-zinc-150 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight lowercase font-mono">SINAIS_ATIVOS</h3>
                <p className="text-[10px] text-zinc-400 uppercase font-mono">Curated Feed</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded">
                {state.radar.length} Feeds
              </span>
            </div>

            <div className="space-y-4 max-h-160 overflow-y-auto pr-1">
              {state.radar.map((s) => (
                <div 
                  key={s.id} 
                  className="bg-zinc-50/50 border border-zinc-150 p-4 rounded-xl space-y-2 hover:border-zinc-250 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 flex items-center gap-1 bg-white border border-zinc-100 px-1.5 py-0.5 rounded">
                      {s.platform === "X" && "𝕏 X / Twitter"}
                      {s.platform === "YouTube" && <><Youtube className="w-3 h-3 text-red-500 fill-red-500" /> YouTube</>}
                      {s.platform === "GitHub" && <><Github className="w-3 h-3 text-zinc-800" /> GitHub</>}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400">
                      {s.date}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-zinc-800 leading-tight">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-150/50">
                    <span className="text-[9.5px] font-mono text-zinc-400 truncate max-w-28">
                      {s.author}
                    </span>
                    <div className="flex gap-1">
                      {s.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[9px] bg-white border border-zinc-100 text-zinc-500 py-0.5 px-1.5 rounded-md font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
