import { useState, useEffect } from "react";
import { 
  Plus, 
  Sparkles, 
  Youtube, 
  Linkedin, 
  Twitter, 
  Instagram,
  Clock, 
  Calendar, 
  Eye, 
  Trash2, 
  X, 
  Check, 
  AlertCircle, 
  ArrowRight,
  PenTool,
  ArrowUpRight,
  RefreshCw,
  EyeIcon,
  Search
} from "lucide-react";
import { AppState, Post } from "../types";
import SocialPostPreview from "./SocialPostPreview";
import { VerifiedBadge } from "./VerifiedBadge";
import { AudioCreator } from "./AudioCreator";

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-4 h-4"}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.84 2.19 1.4 3.48 1.62V9.7c-1.39-.17-2.73-.75-3.82-1.63-.09-.07-.15-.19-.18-.3-.02 1.49-.01 2.99-.02 4.48-.06 2.05-.62 4.12-1.8 5.75-1.52 2.21-4.04 3.65-6.73 3.84-2.58.26-5.28-.6-7.14-2.42C-.17 17.51-1.07 14.15-.4 10.97c.52-2.77 2.45-5.22 5.09-6.32 1.42-.64 2.99-.9 4.54-.79V7.8c-1.12-.17-2.29-.02-3.32.48-1.54.71-2.61 2.24-2.8 3.92-.3 2.13.78 4.31 2.69 5.3 1.54.89 3.49.91 5.04.09.91-.45 1.63-1.22 1.96-2.15.22-.52.28-1.1.28-1.66V0h.03z"/>
  </svg>
);

interface PostsViewProps {
  state: AppState;
  activeChannel: string;
  onAddPost: (post: any) => Promise<void>;
  onUpdatePostStatus: (id: string, status: "Draft" | "Agendado" | "Publicado", scheduledDate?: string) => Promise<void>;
  prefilledPost?: { topic: string; keyword: string } | null;
  onClearPrefilled?: () => void;
  fullscreenMode: boolean;
  setFullscreenMode: (val: boolean) => void;
}

export default function PostsView({ 
  state, 
  activeChannel, 
  onAddPost, 
  onUpdatePostStatus, 
  prefilledPost, 
  onClearPrefilled,
  fullscreenMode,
  setFullscreenMode
}: PostsViewProps) {
  const [showAIWriter, setShowAIWriter] = useState(false);
  const [currentView, setCurrentView] = useState<"kanban" | "calendar">("kanban");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getPostDay = (post: Post, index: number): number => {
    if (post.status !== "Agendado") return 0;
    
    const dateStr = post.scheduledDate || "";
    const matchNum = dateStr.match(/\d+/);
    if (matchNum) {
      const parsed = parseInt(matchNum[0]);
      if (parsed >= 1 && parsed <= 30) {
        return parsed;
      }
    }

    if (dateStr.toLowerCase().includes("amanhã") || dateStr.toLowerCase().includes("amanha")) {
      return 10;
    }
    
    return 10 + ((index * 3) % 18);
  };

  // AI Generator Form States
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Editorial / Profissional");
  const [channel, setChannel] = useState(activeChannel);
  const [keyword, setKeyword] = useState("claude");

  // Hook suggestions tool states
  const [suggestedHooks, setSuggestedHooks] = useState<string[]>([]);
  const [generatingHooks, setGeneratingHooks] = useState(false);

  // Search & Status filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Draft" | "Agendado" | "Publicado">("Todos");

  useEffect(() => {
    setChannel(activeChannel);
  }, [activeChannel]);

  useEffect(() => {
    if (prefilledPost) {
      setTopic(prefilledPost.topic);
      setKeyword(prefilledPost.keyword);
      setShowAIWriter(true);
      if (onClearPrefilled) {
        onClearPrefilled();
      }
    }
  }, [prefilledPost]);

  // Output response state
  const [aiGeneratedTitle, setAiGeneratedTitle] = useState("");
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [suggestedPromptTweak, setSuggestedPromptTweak] = useState("");

  // Tone Analysis States
  const [analyzingTone, setAnalyzingTone] = useState(false);
  const [toneScore, setToneScore] = useState<number | null>(null);
  const [toneAlignment, setToneAlignment] = useState<string>("");
  const [toneFeedback, setToneFeedback] = useState<string>("");
  const [toneSuggestions, setToneSuggestions] = useState<string[]>([]);
  const [toneAdjustedContent, setToneAdjustedContent] = useState<string>("");
  const [toneError, setToneError] = useState("");
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(false);

  const handleAnalyzeTone = async () => {
    if (!aiGeneratedContent.trim()) return;
    setAnalyzingTone(true);
    setToneError("");
    setToneScore(null);
    setToneAlignment("");
    setToneFeedback("");
    setToneSuggestions([]);
    setToneAdjustedContent("");
    setShowVerifiedBadge(false);

    try {
      const response = await fetch("/api/posts/analyze-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: aiGeneratedContent,
          channel: channel || activeChannel || "LinkedIn"
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setToneScore(data.score);
        setToneAlignment(data.alignment);
        setToneFeedback(data.feedback);
        setToneSuggestions(data.suggestions || []);
        setToneAdjustedContent(data.adjustedContent || "");
        
        if (data.score >= 85) {
          setShowVerifiedBadge(true);
        }
      } else {
        setToneError(data.error || "Falha ao analisar o tom.");
      }
    } catch (err: any) {
      setToneError(err.message || "Erro de rede ao conectar-se ao analisador de tom.");
    } finally {
      setAnalyzingTone(false);
    }
  };

  // Real-time Reach Risk Analysis Utility
  const analyzeReachRisk = (content: string, tgtChannel: string) => {
    const reasons: string[] = [];
    if (!content.trim()) return { hasRisk: false, reasons, riskLevel: "Baixo" };
    
    const contentLower = content.toLowerCase();
    
    // 1. External Links Check
    const linkMatches = content.match(/https?:\/\/[^\s]+/gi) || [];
    if (linkMatches.length > 1) {
      reasons.push("Múltiplos links externos identificados. Algoritmos reduzem o alcance orgânico em até 60% para reter usuários na plataforma.");
    } else if (linkMatches.length === 1 && tgtChannel?.toLowerCase() === "linkedin") {
      reasons.push("LinkedIn prioriza links no primeiro comentário. Adicionar link direto no texto reduz significativamente a distribuição orgânica inicial.");
    }

    // 2. Spam words check
    const spamWords = ["grátis", "compre agora", "promocao", "promoção", "desconto", "fique rico", "ganhe dinheiro", "vender mais", "oportunidade única", "vaga urgente", "clique aqui"];
    const foundSpam = spamWords.filter(w => contentLower.includes(w));
    if (foundSpam.length > 0) {
      reasons.push(`Contém termos de spam/vendas (${foundSpam.join(", ")}). Podem ativar filtros automáticos de shadowban.`);
    }

    // 3. CAPITALIZED check
    if (content === content.toUpperCase() && content.length > 55) {
      reasons.push("Conteúdo inteiramente em caixa alta (Gritando). Isso penaliza a estética e viola diretrizes de legibilidade das plataformas.");
    }

    // 4. Excessive Emojis
    const emojiMatches = content.match(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\u2700-\u27BF/g) || [];
    if (emojiMatches.length > 8) {
      reasons.push(`Excesso de emojis (${emojiMatches.length}/8). Pode distrair o leitor e é interpretado como clickbait comercial por determinados canais.`);
    }

    const hasRisk = reasons.length > 0;
    let riskLevel: "Baixo" | "Médio" | "Alto" = "Baixo";
    if (reasons.length >= 2) {
      riskLevel = "Alto";
    } else if (reasons.length === 1) {
      riskLevel = "Médio";
    }

    return { hasRisk, reasons, riskLevel };
  };

  // Hashtag generation state
  const [generatingHashtags, setGeneratingHashtags] = useState(false);

  const handleGenerateHashtags = async () => {
    if (!aiGeneratedContent.trim()) return;
    setGeneratingHashtags(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/posts/generate-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiGeneratedTitle,
          content: aiGeneratedContent,
          channel: channel || "LinkedIn"
        })
      });
      const data = await response.json();
      if (response.ok && data.success && data.hashtags) {
        const hashtagsStr = "\n\n" + data.hashtags.join(" ");
        setAiGeneratedContent(prev => prev.trim() + hashtagsStr);
      } else {
        setErrorMsg(data.error || "Erro ao sugerir hashtags.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de rede ao conectar-se ao gerador de hashtags.");
    } finally {
      setGeneratingHashtags(false);
    }
  };

  // Engagement prediction states
  const [analyzingEngagement, setAnalyzingEngagement] = useState(false);
  const [engagementScore, setEngagementScore] = useState<number | null>(null);
  const [engagementReasons, setEngagementReasons] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState("");

  const handleAnalyzeEngagement = async () => {
    if (!aiGeneratedContent.trim()) return;
    setAnalyzingEngagement(true);
    setAnalysisError("");
    setEngagementScore(null);
    setEngagementReasons([]);
    try {
      const response = await fetch("/api/posts/analyze-engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiGeneratedTitle,
          content: aiGeneratedContent,
          channel: channel || "LinkedIn",
          keyword: keyword || ""
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEngagementScore(data.score);
        setEngagementReasons(data.reasons);
      } else {
        setAnalysisError(data.error || "Falha ao calcular pontuação de engajamento.");
      }
    } catch (err: any) {
      setAnalysisError(err.message || "Erro de rede ao conectar-se ao analisador.");
    } finally {
      setAnalyzingEngagement(false);
    }
  };

  // Viewing Post Modal State
  const [viewingPost, setViewingPost] = useState<any>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<"text" | "social">("social");

  // Base metrics by active channel
  const baseChannelPosts = state.posts.filter(p => p.channel?.toLowerCase() === activeChannel.toLowerCase());
  const totalDraftCount = baseChannelPosts.filter(p => p.status === "Draft").length;
  const totalScheduledCount = baseChannelPosts.filter(p => p.status === "Agendado").length;
  const totalPublishedCount = baseChannelPosts.filter(p => p.status === "Publicado").length;

  // Filter with Search query
  const searchedPosts = baseChannelPosts.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.title.toLowerCase().includes(query) ||
      (p.content && p.content.toLowerCase().includes(query)) ||
      (p.keyword && p.keyword.toLowerCase().includes(query))
    );
  });

  const drafts = searchedPosts.filter(p => p.status === "Draft");
  const scheduled = searchedPosts.filter(p => p.status === "Agendado");
  const published = searchedPosts.filter(p => p.status === "Publicado");

  // Counter tags (maintain overall stats on cards)
  const draftCountText = `${totalDraftCount} aguardando ação`;
  const scheduledCountText = `${totalScheduledCount} nos próximos 7 dias`;
  const publishedCountText = `${totalPublishedCount} +3 vs. mês ant.`;

  const handleSuggestHooks = async () => {
    if (!topic) {
      setErrorMsg("Forneça o tema principal antes de sugerir hooks.");
      return;
    }
    setErrorMsg("");
    setGeneratingHooks(true);
    setSuggestedHooks([]);
    try {
      const response = await fetch("/api/posts/generate-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar hooks com IA.");
      }
      setSuggestedHooks(data.hooks || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão com o gerador de hooks.");
    } finally {
      setGeneratingHooks(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic) {
      setErrorMsg("Forneça o tema principal que deseja abordar no post.");
      return;
    }
    setErrorMsg("");
    setGenerating(true);
    setEngagementScore(null);
    setEngagementReasons([]);
    setAnalysisError("");
    try {
      const response = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic, 
          tone, 
          keyword: keyword.toLowerCase().trim(),
          referencePrompt: state.config.masterPrompt 
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Deu ruim na geração.");
      }
      setAiGeneratedTitle(data.title || topic);
      setAiGeneratedContent(data.content || "");
      setSuggestedPromptTweak(data.suggestedMasterPrompt || "");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão com o gerador Gemini.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePost = async (targetStatus: "Draft" | "Agendado" | "Publicado") => {
    if (!aiGeneratedTitle || !aiGeneratedContent) {
      setErrorMsg("Gere conteúdo antes de salvar.");
      return;
    }
    setErrorMsg("");
    setSaving(true);
    try {
      const scheduledDate = targetStatus === "Agendado" ? "Amanhã, 09:00" : "";
      await onAddPost({
        title: aiGeneratedTitle,
        content: aiGeneratedContent,
        channel,
        status: targetStatus,
        scheduledDate,
        keyword,
      });
      
      // Cleanup
      setTopic("");
      setAiGeneratedTitle("");
      setAiGeneratedContent("");
      setSuggestedPromptTweak("");
      setShowAIWriter(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar post na planilha.");
    } finally {
      setSaving(false);
    }
  };

  const promotePost = async (post: Post, targetStatus: "Agendado" | "Publicado") => {
    const scheduledDateValue = targetStatus === "Agendado" ? "Amanhã, 10:00" : undefined;
    await onUpdatePostStatus(post.id, targetStatus, scheduledDateValue);
  };

  const getChannelIcon = (chName: string, sizeClass = "w-4 h-4") => {
    switch (chName.toLowerCase()) {
      case "linkedin":
        return <Linkedin className={`${sizeClass} text-[#0A66C2]`} />;
      case "twitter":
      case "x":
        return <span className={`${sizeClass} inline-block font-black text-xs text-black font-mono`}>𝕏</span>;
      case "youtube":
        return <Youtube className={`${sizeClass} text-[#FF0000]`} />;
      case "instagram":
        return <Instagram className={`${sizeClass} text-[#E1306C]`} />;
      case "tiktok":
        return <TiktokIcon className={sizeClass} />;
      default:
        return <PenTool className={`${sizeClass} text-zinc-400`} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page header and action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <span className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">
            {activeChannel} · CONTEÚDO
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Geração de Posts
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Gerencie rascunhos, agendamentos e o que foi publicado nos canais integrados.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1 border border-zinc-200 p-1 bg-zinc-50 rounded-lg shadow-3xs shrink-0 select-none">
            <button
              onClick={() => setCurrentView("kanban")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 ${currentView === "kanban" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              Fluxo Kanban
            </button>
            <button
              onClick={() => setCurrentView("calendar")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition duration-150 ${currentView === "calendar" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              Calendário Editorial
            </button>
          </div>

          <button
            onClick={() => setShowAIWriter(true)}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white hover:bg-zinc-850 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Gerar novo post</span>
          </button>
        </div>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-zinc-150 p-4 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">
            ● RASCUNHOS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-zinc-900">{drafts.length}</span>
            <span className="text-xs text-zinc-500 font-medium">{draftCountText}</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-150 p-4 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block font-mono">
            ● AGENDADOS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-zinc-900">{scheduled.length}</span>
            <span className="text-xs text-zinc-500 font-medium">{scheduledCountText}</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-150 p-4 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest block font-mono">
            ● PUBLICADOS EM JUNHO
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-zinc-900">{published.length}</span>
            <span className="text-xs text-zinc-500 font-medium">{publishedCountText}</span>
          </div>
        </div>
      </div>

      {currentView === "kanban" ? (
        <>
          {/* Search Bar & Status Filters */}
      <div className="bg-white border border-zinc-150 p-4 rounded-xl shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar posts por título, palavra-chave ou conteúdo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-zinc-800"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-semibold"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 self-stretch md:self-auto overflow-x-auto">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mr-2 hidden sm:inline">
            Filtrar:
          </span>
          {(["Todos", "Draft", "Agendado", "Publicado"] as const).map((filterOpt) => {
            const isActive = statusFilter === filterOpt;
            const styleLabel = filterOpt === "Todos" ? "Todos" : filterOpt === "Draft" ? "Rascunhos" : filterOpt === "Agendado" ? "Agendados" : "Publicados";
            
            let countLabel = 0;
            if (filterOpt === "Todos") countLabel = searchedPosts.length;
            else if (filterOpt === "Draft") countLabel = drafts.length;
            else if (filterOpt === "Agendado") countLabel = scheduled.length;
            else if (filterOpt === "Publicado") countLabel = published.length;

            return (
              <button
                key={filterOpt}
                onClick={() => setStatusFilter(filterOpt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-3xs"
                    : "bg-zinc-50 hover:bg-zinc-100 text-zinc-550 hover:text-zinc-850 border border-zinc-200/50"
                }`}
              >
                <span>{styleLabel}</span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-500"
                }`}>
                  {countLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Column Kanban Flow */}
      <div className={`grid grid-cols-1 ${statusFilter === "Todos" ? "lg:grid-cols-3" : "grid-cols-1"} gap-6 pt-2`}>
        {/* Col 1: Drafts */}
        {(statusFilter === "Todos" || statusFilter === "Draft") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-sm font-bold text-zinc-700 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-zinc-350"></span>
                Posts Gerados
              </span>
              <span className="bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded-full text-xs font-semibold">
                {drafts.length}
              </span>
            </div>

            <div className="space-y-3">
              {drafts.length > 0 ? (
                drafts.map((post) => (
                  <div key={post.id} className="bg-white border border-zinc-200 p-4 rounded-xl shadow-3xs space-y-3 hover:border-zinc-300 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-mono px-2 py-0.5 rounded-md border border-amber-100 font-semibold uppercase">
                          #{post.keyword}
                        </span>
                        {getChannelIcon(post.channel)}
                      </div>
                      <h3 className="text-xs font-bold text-zinc-800 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="border-t border-zinc-50 pt-2.5 flex items-center justify-between gap-2 mt-2">
                      <button 
                        onClick={() => setViewingPost(post)}
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar</span>
                      </button>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => promotePost(post, "Agendado")}
                          className="bg-indigo-50 border border-indigo-105 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-semibold transition"
                        >
                          Agendar
                        </button>
                        <button 
                          onClick={() => promotePost(post, "Publicado")}
                          className="bg-zinc-900 border border-zinc-950 hover:bg-zinc-800 text-white px-2 py-1 rounded text-[10px] font-semibold transition"
                        >
                          Publicar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-zinc-200/50 p-12 rounded-xl text-center text-zinc-400 bg-zinc-50/20">
                  <p className="text-xs font-medium">Nenhum post encontrado.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Col 2: Scheduled */}
        {(statusFilter === "Todos" || statusFilter === "Agendado") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-sm font-bold text-zinc-700 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Agendados
              </span>
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                {scheduled.length}
              </span>
            </div>

            <div className="space-y-3">
              {scheduled.length > 0 ? (
                scheduled.map((post) => (
                  <div key={post.id} className="bg-white border border-zinc-200 p-4 rounded-xl shadow-3xs space-y-3 hover:border-zinc-350 transition flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getChannelIcon(post.channel)}
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {post.author}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-indigo-650 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3" />
                          <span>{post.scheduledDate}</span>
                        </div>
                      </div>
                      <h3 className="text-xs font-bold text-zinc-800 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="border-t border-zinc-50 pt-2.5 flex items-center justify-between mt-2">
                      <button 
                        onClick={() => setViewingPost(post)}
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar</span>
                      </button>
                      <button 
                        onClick={() => promotePost(post, "Publicado")}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 px-2.5 py-1 rounded text-[10px] font-semibold transition animate-pulse"
                      >
                        Publicar agora
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-zinc-200/50 p-12 rounded-xl text-center text-zinc-400 bg-zinc-50/20">
                  <p className="text-xs font-medium">Nenhum agendamento encontrado.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Col 3: Published */}
        {(statusFilter === "Todos" || statusFilter === "Publicado") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-sm font-bold text-zinc-700 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Feitos do mês
              </span>
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {published.length}
              </span>
            </div>

            <div className="space-y-3">
              {published.length > 0 ? (
                published.map((post) => (
                  <div key={post.id} className="bg-white border border-zinc-250 p-4 rounded-xl shadow-3xs space-y-3 hover:border-zinc-350 transition flex flex-col justify-between border-l-4 border-l-green-500">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getChannelIcon(post.channel)}
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {post.publishDate}
                          </span>
                        </div>
                        {post.views !== undefined && (
                          <span className="text-[10px] font-mono text-zinc-400 font-medium">
                            {post.views.toLocaleString()} visualizações
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-zinc-800 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="border-t border-zinc-50 pt-2.5 mt-2">
                      <button 
                        onClick={() => setViewingPost(post)}
                        className="text-[11px] font-semibold text-green-700 hover:text-green-800 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Publicado</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-zinc-200/50 p-12 rounded-xl text-center text-zinc-400 bg-zinc-50/20">
                  <p className="text-xs font-medium">Nenhum post publicado encontrado.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in p-1">
          {/* Main Calendar Month Grid */}
          <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-800 font-mono tracking-wide uppercase">📅 JUNHO 2026</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Arraste rascunhos para os dias para agendá-los ou mude de célula para alterar a data.</p>
              </div>
              <span className="text-[10px] bg-emerald-50 border border-emerald-150 text-emerald-700 font-mono font-bold px-2.5 py-1 rounded">
                DRAG_AND_DROP DISPONÍVEL
              </span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest pb-1 border-b border-zinc-100/50">
              {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(wd => (
                <div key={wd}>{wd}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2.5 auto-rows-[96px]">
              {(() => {
                const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
                const calendarCells = [null, ...daysInMonth]; // June 1st, 2026 is Monday, so 1 empty slot for Sunday
                return calendarCells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="bg-zinc-50/20 border border-zinc-100/20 rounded-xl" />;
                  }

                  // Filter active posts on this day
                  const dayPosts = state.posts.filter(p => p.status === "Agendado" && getPostDay(p, state.posts.indexOf(p)) === day);

                  return (
                    <div
                      key={`day-${day}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const postId = e.dataTransfer.getData("text/plain");
                        if (!postId) return;
                        const formattedDate = `Dia ${day} de Junho, 10:00`;
                        await onUpdatePostStatus(postId, "Agendado", formattedDate);
                      }}
                      className={`border rounded-xl p-1.5 flex flex-col justify-between transition-all relative select-none ${
                        day === 9 
                          ? "bg-indigo-50/15 border-indigo-300 ring-1 ring-indigo-300/40" 
                          : "bg-white border-zinc-200 hover:border-zinc-350"
                      }`}
                    >
                      {/* Day number label */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold font-mono ${day === 9 ? "text-indigo-600 bg-indigo-100/70 w-5 h-5 rounded-full flex items-center justify-center scale-95" : "text-zinc-500"}`}>
                          {day}
                        </span>
                        {day === 9 && (
                          <span className="text-[8px] font-mono bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-extrabold tracking-tight uppercase leading-none">Hoje</span>
                        )}
                      </div>

                      {/* Post cells inside day */}
                      <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-0.5 scrollbar-none">
                        {dayPosts.map((post) => (
                          <div
                            key={post.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", post.id);
                            }}
                            onClick={() => setViewingPost(post)}
                            className="bg-zinc-50 border border-zinc-150 rounded px-1.5 py-0.5 flex items-center justify-between gap-1 cursor-grab active:cursor-grabbing hover:bg-zinc-100 hover:border-zinc-250 transition-all shadow-3xs"
                          >
                            <div className="flex items-center gap-1 truncate w-full">
                              {getChannelIcon(post.channel, "w-3 h-3 shrink-0")}
                              <span className="text-[9.5px] font-semibold text-zinc-700 truncate block leading-snug">
                                {post.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Draggable Rascunhos Sidebar Pane */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-3xs flex flex-col h-[600px] text-left">
            <div className="border-b border-zinc-200 pb-3 flex justify-between items-center flex-shrink-0">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-zinc-700 font-mono tracking-wide uppercase">Rascunhos Livres</h4>
                <p className="text-[10px] text-zinc-400">Arraste para os dias do calendário</p>
              </div>
              <span className="bg-zinc-200 text-zinc-650 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0">
                {(() => {
                  const draftsList = state.posts.filter(p => p.status === "Draft" && (!activeChannel || p.channel?.toLowerCase() === activeChannel?.toLowerCase() || activeChannel === "Todos"));
                  return draftsList.length;
                })()} rascunhos
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1 scrollbar-thin">
              {(() => {
                const draftsList = state.posts.filter(p => p.status === "Draft" && (!activeChannel || p.channel?.toLowerCase() === activeChannel?.toLowerCase() || activeChannel === "Todos"));
                return draftsList.length > 0 ? (
                  draftsList.map((post) => (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", post.id);
                      }}
                      className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1.5 cursor-grab active:cursor-grabbing hover:border-zinc-350 transition duration-150 shadow-3xs hover:shadow-2xs select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.5 border border-amber-100 rounded font-mono font-bold uppercase shrink-0">
                          #{post.keyword}
                        </span>
                        {getChannelIcon(post.channel, "w-3.5 h-3.5")}
                      </div>
                      <h5 className="text-[11.5px] font-bold text-zinc-805 line-clamp-2 leading-snug">
                        {post.title}
                      </h5>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-6 text-center space-y-2">
                    <PenTool className="w-8 h-8 text-zinc-300 stroke-[1.5]" />
                    <p className="text-xs italic font-medium">Nenhum rascunho disponível.</p>
                    <p className="text-[9.5px] text-zinc-400/80 leading-normal">Crie rascunhos no redator de IA para listá-los nesta fila de agendamento!</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Viewing Post Detail Modal */}
      {viewingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                {getChannelIcon(viewingPost.channel)}
                <span className="text-xs font-mono font-bold text-zinc-500">
                  Visualização de Post • {viewingPost.status}
                </span>
              </div>
              <button 
                onClick={() => setViewingPost(null)}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Swappers */}
            <div className="flex border-b border-zinc-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActivePreviewTab("social")}
                className={`flex-1 text-center py-2 text-xs font-bold border-b-2 transition-all ${
                  activePreviewTab === "social"
                    ? "border-emerald-500 text-emerald-600 font-extrabold"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Pré-visualização do Post
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab("text")}
                className={`flex-1 text-center py-2 text-xs font-bold border-b-2 transition-all ${
                  activePreviewTab === "text"
                    ? "border-emerald-500 text-emerald-600 font-extrabold"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Dados Brutos & Metadados
              </button>
            </div>

            {activePreviewTab === "social" ? (
              <div className="py-2.5 overflow-y-auto max-h-[380px]">
                <SocialPostPreview post={viewingPost} state={state} />
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <h2 className="text-md font-bold text-zinc-900 leading-snug">
                  {viewingPost.title}
                </h2>
                <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl text-xs text-zinc-700 overflow-y-auto max-h-48 whitespace-pre-line leading-relaxed font-sans">
                  {viewingPost.content}
                </div>

                <div className="flex gap-2 flex-wrap text-[10px] font-mono pt-1">
                  <span className="bg-zinc-100 text-zinc-550 border px-2 py-0.5 rounded-sm">
                    Autor: {viewingPost.author}
                  </span>
                  <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-sm">
                    Palavra-Chave: {viewingPost.keyword}
                  </span>
                  {viewingPost.scheduledDate && (
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-sm">
                      Agendado: {viewingPost.scheduledDate}
                    </span>
                  )}
                  {viewingPost.publishDate && (
                    <span className="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-sm">
                      Publicado: {viewingPost.publishDate}
                    </span>
                  )}
                </div>

                {/* Expected Engagement Scorecard inside Detail Viewer */}
                <div id="quick-viewer-scorecard" className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-left space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">QUALIFICAÇÃO DE ENGAJAMENTO</span>
                      <h5 className="text-[11px] font-bold text-zinc-800">Retorno Preditivo do Algoritmo</h5>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setAnalyzingEngagement(true);
                        setAnalysisError("");
                        try {
                          const response = await fetch("/api/posts/analyze-engagement", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: viewingPost.title,
                              content: viewingPost.content,
                              channel: viewingPost.channel,
                              keyword: viewingPost.keyword
                            })
                          });
                          const data = await response.json();
                          if (response.ok && data.success) {
                            setViewingPost({ ...viewingPost, score: data.score, reasons: data.reasons });
                          } else {
                            setAnalysisError(data.error || "Erro ao qualificar.");
                          }
                        } catch (err: any) {
                          setAnalysisError("Erro de comunicação.");
                        } finally {
                          setAnalyzingEngagement(false);
                        }
                      }}
                      disabled={analyzingEngagement}
                      className="text-[9.5px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 px-2.5 py-1 rounded-md transition duration-150 flex items-center gap-1 shrink-0"
                    >
                      {analyzingEngagement ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5 text-amber-400" />}
                      <span>{analyzingEngagement ? "Analisando..." : "Calcular Score"}</span>
                    </button>
                  </div>

                  {analysisError && <p className="text-[10px] text-red-500 font-medium">{analysisError}</p>}

                  {viewingPost.score !== undefined ? (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-200/55 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-120">{viewingPost.score}%</span>
                        <span className="text-[11px] font-bold text-zinc-805">
                          {viewingPost.score >= 80 ? "🔥 Potencial Viral Altíssimo!" :
                           viewingPost.score >= 60 ? "📈 Alto Engajamento Estimado!" :
                           viewingPost.score >= 40 ? "⚖️ Engajamento Saudável & Focado" :
                           "⚠️ Risco de Baixo Engajamento"}
                        </span>
                      </div>
                      {viewingPost.reasons && viewingPost.reasons.length > 0 && (
                        <div className="bg-white p-2 border border-zinc-100 rounded-lg text-[10px] text-zinc-500 leading-relaxed">
                          <span className="font-semibold text-zinc-700 block">Feedback da IA:</span>
                          {viewingPost.reasons[0]}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-400 italic">Clique ao lado para avaliar a taxa de aceitação histórica deste conteúdo.</p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingPost(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Writer Panel Drawer */}
      {showAIWriter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-55 transition-all">
          <div className="w-full max-w-xl bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300" />
                  <h2 className="text-lg font-bold text-zinc-900">Redator de IA (Gemini 3.5)</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFullscreenMode(!fullscreenMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-650 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${fullscreenMode ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`}></span>
                    {fullscreenMode ? "Modo Zen: ON" : "Modo Zen"}
                  </button>
                  <button
                    onClick={() => setShowAIWriter(false)}
                    className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form and Generated result view in single viewport */}
              {!aiGeneratedContent ? (
                /* Generator Form */
                <div className="space-y-4 pt-2">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                        Qual é o Tema ou Título do Post?
                      </label>
                      <button
                        type="button"
                        onClick={handleSuggestHooks}
                        disabled={generatingHooks || !topic}
                        className={`text-[10px] font-semibold flex items-center gap-1 transition-all ${
                          !topic 
                            ? "text-zinc-350 cursor-not-allowed" 
                            : "text-amber-600 hover:text-amber-700 font-bold hover:scale-102"
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${generatingHooks ? "animate-spin text-amber-500" : "text-amber-400 fill-amber-300"}`} />
                        <span>Sugerir 3 Hooks [IA]</span>
                      </button>
                    </div>
                    <textarea
                      required
                      placeholder="Ex: Como o Claude Code e terminal autônomo está mudando o ecossistema de SaaS ou as 5 automações que economizam 20h de desenvolvimento na NoCode Startup..."
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value);
                        if (suggestedHooks.length > 0) {
                          setSuggestedHooks([]);
                        }
                      }}
                      rows={3}
                      className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                    />

                    {/* Hook generation loaders and results */}
                    {generatingHooks && (
                      <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-150 flex items-center gap-2 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                        <span className="text-[11px] text-zinc-500 font-medium font-sans">Elaborando 3 hooks magnéticos baseados no seu tópico...</span>
                      </div>
                    )}

                    {suggestedHooks.length > 0 && (
                      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-2.5 animate-fade-in text-left">
                        <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider block">
                          💡 Escolha um Hook Gerado pelo Gemini:
                        </span>
                        <div className="space-y-1.5">
                          {suggestedHooks.map((hook, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setTopic(hook);
                                setSuggestedHooks([]);
                              }}
                              className="w-full text-left text-xs bg-white hover:bg-amber-100/40 p-2.5 rounded-lg border border-amber-200/60 text-zinc-800 transition-all font-medium leading-relaxed flex items-start gap-2 shadow-3xs"
                            >
                              <span className="bg-amber-100 text-amber-805 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                                #{index + 1}
                              </span>
                              <span>{hook}</span>
                            </button>
                          ))}
                        </div>
                        <span className="text-[9px] text-amber-600 block italic leading-tight">
                          *Clique em uma sugestão para aplicá-la diretamente como tema do post.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                        Tom de Voz
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg px-2 py-2 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                      >
                        <option value="Editorial / Impactante">Editorial / Impactante</option>
                        <option value="Técnico / Direto (Desenvolvedor)">Técnico / Direto</option>
                        <option value="Provocativo / Filosofia de IA">Provocativo / Filosofia</option>
                        <option value="Storytelling Dinâmico">Storytelling NoCode</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                        Palavra-Chave (CTA Comentário)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: claude, curso, automacao"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full text-xs font-mono text-zinc-700 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                      Canal de Publicação Alvo
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {["LinkedIn", "Twitter", "Instagram", "TikTok", "YouTube"].map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setChannel(ch)}
                          className={`flex items-center justify-center gap-1 py-1.5 border rounded-lg text-xs font-semibold transition ${
                            channel?.toLowerCase() === ch.toLowerCase()
                              ? "bg-zinc-900 text-white border-zinc-950 shadow-xs" 
                              : "border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                          }`}
                        >
                          {getChannelIcon(ch, "w-3.5 h-3.5")}
                          <span className="truncate">{ch}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-600 text-white font-semibold text-xs py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Redigindo com IA... (Pode levar uns segundos)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" />
                        <span>Gerar Cópia de Alta Consistência</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Output Workspace Editor */
                <div className="space-y-4 pt-1 animate-fade-in block">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                      Manchete Gerada
                    </label>
                    <input
                      type="text"
                      value={aiGeneratedTitle}
                      onChange={(e) => setAiGeneratedTitle(e.target.value)}
                      className="w-full text-xs font-bold text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                        Corpo do Post (Editável)
                      </label>
                      <span className="text-[9px] text-zinc-400">
                        *Livre de links diretos conforme algoritmo
                      </span>
                    </div>
                    <textarea
                      value={aiGeneratedContent}
                      onChange={(e) => setAiGeneratedContent(e.target.value)}
                      rows={11}
                      className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-3 whitespace-pre-line leading-relaxed focus:ring-1 focus:ring-zinc-900"
                    />

                    {/* Auto-Hashtag Quick Inserters */}
                    <div className="space-y-1.5 pt-1 text-left">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                        Auto-Hashtag (Inserção Rápida de Grupo Temático)
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {(state.config.hashtagGroups || [
                          { id: "1", name: "#marketing", hashtags: "#marketing #socialmedia #digitalmarketing #seo" },
                          { id: "2", name: "#ia", hashtags: "#artificialintelligence #machinelearning #automation #nocode" },
                          { id: "3", name: "#startup", hashtags: "#startups #venturecapital #growthhacking #founder" }
                        ]).map((grp) => (
                          <button
                            key={grp.id}
                            type="button"
                            onClick={() => {
                              setAiGeneratedContent(prev => {
                                const trimmed = prev.trim();
                                return trimmed ? `${trimmed}\n\n${grp.hashtags}` : grp.hashtags;
                              });
                            }}
                            className="bg-zinc-55 border border-zinc-205 hover:bg-indigo-50 hover:border-indigo-300 text-zinc-700 hover:text-indigo-800 text-[10.5px] px-2.5 py-1.5 rounded-lg font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                            title={grp.hashtags}
                          >
                            <span className="text-zinc-400 font-mono">#</span>
                            <span className="font-semibold">{grp.name.replace("#", "")}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Real-time Reach Risk Assessment dynamic banner */}
                    {(() => {
                      const analysis = analyzeReachRisk(aiGeneratedContent, channel || "LinkedIn");
                      if (!analysis.hasRisk) return null;
                      return (
                        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-left space-y-1.5 animate-fade-in font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-250 px-2 py-0.5 rounded tracking-wide font-mono uppercase">
                              ALERT_REACH_RISK: {analysis.riskLevel}
                            </span>
                            <span className="text-[11px] font-extrabold text-amber-900 leading-normal">Risco de Alcance {analysis.riskLevel}</span>
                          </div>
                          <ul className="space-y-1 pl-1">
                            {analysis.reasons.map((r, i) => (
                              <li key={i} className="text-[10px] text-amber-800 leading-relaxed flex items-start gap-1">
                                <span className="text-amber-400 shrink-0 select-none">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}

                    <div className="flex justify-between items-center bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 mt-2">
                      <span className="text-[10px] text-zinc-500 font-medium font-sans">
                        Sugerir 5 hashtags mais relevantes com IA Gemini para todos os canais:
                      </span>
                      <button
                        type="button"
                        onClick={handleGenerateHashtags}
                        disabled={generatingHashtags || !aiGeneratedContent.trim()}
                        className="text-[10.5px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-3xs px-3 py-1.5 rounded-lg transition disabled:opacity-50 shrink-0 select-none"
                      >
                        {generatingHashtags ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-indigo-650" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                        )}
                        <span>{generatingHashtags ? "Gerando..." : "Gerar Hashtags"}</span>
                      </button>
                    </div>
                  </div>

                  {suggestedPromptTweak && (
                    <div className="bg-amber-50/60 border border-amber-200/50 p-3 rounded-lg text-left space-y-1">
                      <span className="text-[9px] font-mono font-bold text-amber-800 tracking-wider uppercase block">
                        Sugestão de Prompt Mestre
                      </span>
                      <p className="text-[11px] text-amber-900 italic font-medium">
                        {suggestedPromptTweak}
                      </p>
                    </div>
                  )}

                  {/* AI Tone Consistency Analysis Section */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 text-left space-y-3 shadow-3xs">
                    <div className="flex items-center justify-between gap-2.5 bg-zinc-50/50 p-2.5 border border-zinc-150 rounded-lg">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">ANÁLISE DE TOM (AI ENGINE)</span>
                        <h4 className="text-xs font-bold text-zinc-800">Conformidade com {channel || "LinkedIn"}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleAnalyzeTone}
                        disabled={analyzingTone || !aiGeneratedContent.trim()}
                        className="text-[10.5px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 disabled:bg-zinc-100 disabled:text-zinc-350 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 select-none cursor-pointer"
                      >
                        {analyzingTone ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                        )}
                        <span>{analyzingTone ? "Avaliando..." : "Analisar Tom"}</span>
                      </button>
                    </div>

                    {toneError && (
                      <p className="text-[10px] text-rose-500 font-semibold">{toneError}</p>
                    )}

                    {toneScore !== null ? (
                      <div className="space-y-3 pt-1 border-t border-zinc-150/50 animate-fade-in text-left">
                        <div className="grid grid-cols-2 gap-2 text-center font-mono">
                          <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                            <span className="text-[9px] font-mono text-zinc-400 uppercase block">Nota de Tom</span>
                            <span className="text-sm font-bold text-zinc-850">{toneScore}%</span>
                          </div>
                          <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                            <span className="text-[9px] font-mono text-zinc-400 uppercase block">Alinhamento</span>
                            <span className={`text-sm font-bold ${
                              toneAlignment === "Crítico" ? "text-rose-600" :
                              toneAlignment === "Razoável" ? "text-amber-600" :
                              "text-emerald-600"
                            }`}>{toneAlignment}</span>
                          </div>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-lg text-xs leading-relaxed font-normal text-zinc-700">
                          <span className="font-semibold text-zinc-800 font-mono block text-[10.5px] uppercase">Análise do Tom:</span>
                          <p className="text-[11px] pt-1 leading-relaxed">{toneFeedback}</p>
                        </div>

                        {toneSuggestions.length > 0 && (
                          <div className="space-y-1 pl-1">
                            <span className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase">Sugestões de melhoria:</span>
                            {toneSuggestions.map((sug, i) => (
                              <div key={i} className="text-[10.5px] text-zinc-650 flex items-start gap-1.5 leading-relaxed font-medium">
                                <span className="text-zinc-300 shrink-0">•</span>
                                <span>{sug}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {toneAdjustedContent && toneAdjustedContent !== aiGeneratedContent && (
                          <div className="bg-indigo-50/50 border border-indigo-150 p-3.5 rounded-xl space-y-3 text-left">
                            <h5 className="text-[11px] font-bold text-indigo-900 font-mono uppercase tracking-wide">Cópia Reescrita Ajustada pelo Gemini</h5>
                            <div className="bg-white border border-indigo-100 p-3 rounded-lg text-[10.5px] text-zinc-700 max-h-36 overflow-y-auto whitespace-pre-line font-mono leading-relaxed select-text">
                              {toneAdjustedContent}
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setAiGeneratedContent(toneAdjustedContent);
                                  setToneScore(null);
                                  setToneAdjustedContent("");
                                }}
                                className="bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg transition shadow-xs cursor-pointer"
                              >
                                Aplicar reescrita sugerida
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-400 italic">Avalie a inteligência do tom de voz para adequá-lo ao canal selecionado.</p>
                    )}
                  </div>

                  {/* AI Expected Engagement Scorecard */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-left space-y-3">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">MÉTRICA PREDITIVA</span>
                        <h4 className="text-xs font-bold text-zinc-800">Pontuação de Engajamento Esperada</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleAnalyzeEngagement}
                        disabled={analyzingEngagement || !aiGeneratedContent.trim()}
                        className="text-[10px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 shadow-2xs"
                      >
                        {analyzingEngagement ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            <span>Analisando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                            <span>Avaliar Cópia</span>
                          </>
                        )}
                      </button>
                    </div>

                    {analysisError && (
                      <p className="text-[10px] text-red-500 font-medium">{analysisError}</p>
                    )}

                    {engagementScore !== null ? (
                      <div className="space-y-2.5 pt-2 border-t border-zinc-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full border-4 border-indigo-500 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-zinc-800">{engagementScore}%</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Grau de Impacto</span>
                            <h5 className="text-xs font-bold text-zinc-800">
                              {engagementScore >= 80 ? "🔥 Potencial Viral Altíssimo!" :
                               engagementScore >= 60 ? "📈 Alto Engajamento Estimado" :
                               engagementScore >= 40 ? "⚖️ Engajamento Saudável & Focado" :
                               "⚠️ Risco de Baixa Retenção"}
                            </h5>
                          </div>
                        </div>

                        {engagementReasons.length > 0 && (
                          <div className="space-y-1 bg-white rounded-lg p-2.5 border border-zinc-150">
                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">RAZÕES & CORREÇÕES:</span>
                            <ul className="space-y-1">
                              {engagementReasons.slice(0, 3).map((reason, idx) => (
                                <li key={idx} className="text-[10px] text-zinc-600 flex items-start gap-1 leading-relaxed">
                                  <span className="text-zinc-300 shrink-0">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-400 italic">Dispare o modelo preditivo para estimar a aceitação de seu post perante seu canal antes de salvá-lo como Draft ou Agendado.</p>
                    )}
                  </div>

                  {/* Premium Spoken Audiovisual synthesis module */}
                  {aiGeneratedContent && (
                    <div className="pt-2">
                      <AudioCreator text={aiGeneratedContent} />
                    </div>
                  )}

                  <div className="flex justify-between gap-2.5 pt-2 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAiGeneratedContent("");
                        setAiGeneratedTitle("");
                        setSuggestedPromptTweak("");
                      }}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 px-3 py-2 border rounded-lg hover:bg-zinc-50 pointer-events-auto cursor-pointer"
                    >
                      Refazer Geração
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSavePost("Draft")}
                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Salvar Rascunho
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSavePost("Agendado")}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Agendar Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Verified Badge Popup */}
            <VerifiedBadge 
              show={showVerifiedBadge} 
              score={toneScore || 0} 
              onComplete={() => setShowVerifiedBadge(false)} 
            />

            {/* Footer placeholder */}
            <div className="border-t border-zinc-100 pt-3 text-[10px] text-zinc-400 text-center font-mono">
              Processado via @google/genai com o modelo gemini-3.5-flash
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
