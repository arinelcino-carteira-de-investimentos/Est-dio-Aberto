import React, { useState, FormEvent, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Play, 
  Pause, 
  ExternalLink, 
  SlidersHorizontal,
  Bot, 
  Link,
  KeyRound,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { AppState, Campaign } from "../types";

interface CampaignsViewProps {
  state: AppState;
  activeChannel: string;
  onAddCampaign: (campaign: any) => Promise<void>;
  onToggleCampaign: (id: string) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
}

type TabType = "Todas" | "Ativas" | "Pausadas" | "Concluídas";

export default function CampaignsView({ state, activeChannel, onAddCampaign, onToggleCampaign, onDeleteCampaign }: CampaignsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [robot, setRobot] = useState("linkedin-reply-comments");
  const [postTitle, setPostTitle] = useState("");
  const [postLink, setPostLink] = useState("");
  const [keyword, setKeyword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isLowPerformance = (c: Campaign) => {
    if (c.status !== "Ativa" || c.respondidos < 10) return false;
    const rate = (c.leads / c.respondidos) * 100;
    if (rate >= 5) return false;
    
    // Check if created more than 48 hours ago
    const createdDate = new Date(c.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours >= 48;
  };

  useEffect(() => {
    const ch = activeChannel.toLowerCase();
    if (ch === "linkedin") setRobot("linkedin-reply-comments");
    else if (ch === "instagram") setRobot("instagram-reply-comments");
    else if (ch === "tiktok") setRobot("tiktok-reply-comments");
    else if (ch === "youtube") setRobot("youtube-auto-comment-reply");
  }, [activeChannel]);

  const channelCampaigns = state.campaigns.filter((campaign) => {
    const ch = activeChannel.toLowerCase();
    return campaign.robot.toLowerCase().startsWith(ch);
  });

  const filteredCampaigns = channelCampaigns.filter((campaign) => {
    // Tab filter
    if (activeTab === "Ativas" && campaign.status !== "Ativa") return false;
    if (activeTab === "Pausadas" && campaign.status !== "Pausada") return false;
    if (activeTab === "Concluídas" && campaign.status !== "Concluída") return false;

    // Search filter
    const matchesSearch = 
      campaign.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.robot.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Count indices based on active channel
  const countAll = channelCampaigns.length;
  const countActive = channelCampaigns.filter(c => c.status === "Ativa").length;
  const countPaused = channelCampaigns.filter(c => c.status === "Pausada").length;
  const countComplete = channelCampaigns.filter(c => c.status === "Concluída").length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !keyword) {
      setErrorMsg("Por favor, preencha o título do post e a palavra-chave de ativação.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      await onAddCampaign({
        robot,
        postTitle,
        postLink: postLink || "https://www.linkedin.com/posts/matheuscastelobranco_open_studio",
        keyword: keyword.toLowerCase().trim(),
      });
      // Reset
      setPostTitle("");
      setPostLink("");
      setKeyword("");
      setShowDrawer(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao adicionar campanha.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner & Headings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <span className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">
            {activeChannel} · AUTOMAÇÃO
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Campanhas
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Painel de Controle de suas campanhas de automação no {activeChannel}. Crie robôs de resposta automática ou engajamento de leads.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova campanha</span>
          </button>
        </div>
      </div>

      {/* Tabs list & search controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 bg-white p-3 rounded-xl border border-zinc-150 shadow-2xs">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-zinc-100 p-1 rounded-lg">
          {(["Todas", "Ativas", "Pausadas", "Concluídas"] as TabType[]).map((tab) => {
            const count = 
              tab === "Todas" ? countAll :
              tab === "Ativas" ? countActive :
              tab === "Pausadas" ? countPaused : countComplete;

            const isSelected = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                  isSelected 
                    ? "bg-white text-zinc-900 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                  isSelected ? "bg-zinc-100 text-zinc-650" : "bg-zinc-200/50 text-zinc-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por post ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs placeholder:text-zinc-400 text-zinc-800 bg-zinc-50/50 border border-zinc-200 rounded-lg pl-9 pr-4 py-2 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/70 border-b border-zinc-150 text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">
                <th className="px-6 py-4">Robô</th>
                <th className="px-6 py-4">Post de Origem</th>
                <th className="px-6 py-4 text-center">Keyword</th>
                <th className="px-6 py-4 text-center">Respondidos</th>
                <th className="px-6 py-4 text-center">Pendentes</th>
                <th className="px-6 py-4 text-center">Leads Capturados</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-zinc-50/40 transition-colors">
                    {/* ROBÔ type with specialized color theme */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md relative ${
                          campaign.robot.startsWith("linkedin-reply") 
                            ? "bg-blue-50 text-blue-600 border border-blue-105" 
                            : "bg-indigo-50 text-indigo-600 border border-indigo-105"
                        }`}>
                          <Bot className="w-4 h-4" />
                          {isLowPerformance(campaign) && (
                            <span 
                              className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm animate-bounce" 
                              title="ALERTA: Conversão abaixo de 5% há mais de 48 horas seguidas!"
                            >
                              !
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-zinc-700 font-semibold">
                          {campaign.robot}
                        </span>
                      </div>
                    </td>

                    {/* POST target description */}
                    <td className="px-6 py-4 max-w-xs md:max-w-md">
                      <div className="space-y-1">
                        <p className="font-semibold text-zinc-800 leading-snug">
                          {campaign.postTitle}
                        </p>
                        <a 
                          href={campaign.postLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-zinc-400 font-medium hover:text-[#0A66C2] flex items-center gap-1 transition-all"
                        >
                          <span className="truncate max-w-64">{campaign.postLink}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      </div>
                    </td>

                    {/* KEYWORD badge */}
                    <td className="px-6 py-4 text-center">
                      <span className="bg-amber-100/60 text-amber-800 border border-amber-200/50 text-xs font-mono font-bold px-2.5 py-1 rounded">
                        {campaign.keyword}
                      </span>
                    </td>

                    {/* Stats indexes */}
                    <td className="px-6 py-4 text-center font-mono font-bold text-zinc-800">
                      {campaign.respondidos.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-zinc-500 font-medium">
                      {campaign.pendentes.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-green-600">
                      {campaign.leads.toLocaleString()}
                    </td>

                    {/* Status toggle lever */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => onToggleCampaign(campaign.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide ${
                            campaign.status === "Ativa"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-250"
                          }`}
                        >
                          {campaign.status === "Ativa" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>ATIVA</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                              <span>PAUSADA</span>
                            </>
                          )}
                        </button>
                        {isLowPerformance(campaign) && (
                          <span 
                            className="inline-flex items-center gap-1 text-[9px] font-bold font-mono bg-red-50 text-red-600 border border-red-200 rounded px-1.5 py-0.5 animate-pulse uppercase tracking-wider" 
                            title="ALERTA: Taxa de conversão abaixo de 5% por 48 horas seguidas!"
                          >
                            <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                            ALERTA!
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Specific Action controls */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onToggleCampaign(campaign.id)}
                          className="p-1 px-1.5 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-800 transition-all"
                          title={campaign.status === "Ativa" ? "Pausar bot" : "Ativar bot"}
                        >
                          {campaign.status === "Ativa" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onDeleteCampaign(campaign.id)}
                          className="p-1 px-1.5 hover:bg-red-50 rounded text-zinc-400 hover:text-red-500 transition-all"
                          title="Excluir automador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-zinc-400 font-medium">
                    Nenhuma campanha de resposta ativa ou rascunho encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer slide-over mockup container for creating campaigns */}
      {showDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-55 transition-all">
          <div className="w-full max-w-md bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in">
            
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-zinc-900">Configurar Bot Automador</h2>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-zinc-50 p-3.5 border border-zinc-150 rounded-lg">
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                  Este automador monitora comentários no LinkedIn. Quando o usuário comenta a <strong>palavra-chave</strong>, o robô curte do comentário, responde de volta e dispara uma mensagem na DM com seu link!
                </p>
              </div>

              {/* Form Input block */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Automation Type Select */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-sans font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-zinc-400" />
                    Tipo do Script Autômato
                  </label>
                  <select
                    value={robot}
                    onChange={(e) => setRobot(e.target.value)}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                  >
                    {activeChannel.toLowerCase() === "linkedin" && (
                      <>
                        <option value="linkedin-reply-comments">linkedin-reply-comments (Responder comentários + DM)</option>
                        <option value="linkedin-dm-new">linkedin-dm-new (DM para novos contatos aceitos)</option>
                        <option value="linkedin-dm-reconnect">linkedin-dm-reconnect (Reatamento comercial de conversas antigas)</option>
                      </>
                    )}
                    {activeChannel.toLowerCase() === "instagram" && (
                      <>
                        <option value="instagram-reply-comments">instagram-reply-comments (Responder direct / comentários)</option>
                        <option value="instagram-story-mention">instagram-story-mention (Responder a menções nos Stories)</option>
                        <option value="instagram-dm-broadcast">instagram-dm-broadcast (Lista de transmissão automática)</option>
                      </>
                    )}
                    {activeChannel.toLowerCase() === "tiktok" && (
                      <>
                        <option value="tiktok-reply-comments">tiktok-reply-comments (Auto-reply nos comentários do vídeo)</option>
                        <option value="tiktok-dm-new-follower">tiktok-dm-new-follower (Boas-vindas para novos seguidores)</option>
                        <option value="tiktok-video-stitch-outreach">tiktok-video-stitch-outreach (DM de prospecção via Duetos/Stitch)</option>
                      </>
                    )}
                    {activeChannel.toLowerCase() === "youtube" && (
                      <>
                        <option value="youtube-auto-comment-reply">youtube-auto-comment-reply (Comentário pinned e auto-reply)</option>
                        <option value="youtube-community-post-outreach">youtube-community-post-outreach (Mailing de posts de comunidade)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Campaign Origin Description */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-sans font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                    Título do Post de Origem no {activeChannel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Ex: Como configurar robôs de IA no ${activeChannel}`}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                  />
                </div>

                {/* Post linkage url */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-sans font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-zinc-400" />
                    Link de Referência do Post ({activeChannel} URL)
                  </label>
                  <input
                    type="url"
                    placeholder={`https://www.${activeChannel.toLowerCase()}.com/posts/...`}
                    value={postLink}
                    onChange={(e) => setPostLink(e.target.value)}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                  />
                </div>

                {/* Trigger Keyword input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-sans font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                    Palavra-Chave de Ativação (Única palavra)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="Ex: claude ou curso ou design"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                    className="w-full text-xs font-mono text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                  />
                  <span className="text-[9px] text-zinc-400 italic block mt-0.5">
                    Apenas letras, números ou hífens. Sem espaços ou sustenido.
                  </span>
                </div>
              </form>
            </div>

            {/* Footer controls inside drawer */}
            <div className="border-t border-zinc-100 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="flex-1 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 px-4 py-2.5 rounded-lg text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Construir Robô</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
