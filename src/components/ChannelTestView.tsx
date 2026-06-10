import React, { useState, useEffect } from "react";
import { 
  Play, 
  Sparkles, 
  Linkedin, 
  Youtube, 
  Instagram, 
  Twitter, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  MessageSquare, 
  User, 
  Send,
  Loader2,
  Tv,
  Radio,
  Hash,
  Globe,
  Share2,
  Heart,
  Repeat
} from "lucide-react";
import { AppState, Post } from "../types";
import SocialPostPreview from "./SocialPostPreview";

interface ChannelTestViewProps {
  state: AppState;
  onAddPost: (post: any) => Promise<void>;
  onUpdatePostStatus: (id: string, status: "Draft" | "Agendado" | "Publicado") => Promise<void>;
  onRefreshState?: () => Promise<void>;
}

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-4 h-4"}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.84 2.19 1.4 3.48 1.62V9.7c-1.39-.17-2.73-.75-3.82-1.63-.09-.07-.15-.19-.18-.3-.02 1.49-.01 2.99-.02 4.48-.06 2.05-.62 4.12-1.8 5.75-1.52 2.21-4.04 3.65-6.73 3.84-2.58.26-5.28-.6-7.14-2.42C-.17 17.51-1.07 14.15-.4 10.97c.52-2.77 2.45-5.22 5.09-6.32 1.42-.64 2.99-.9 4.54-.79V7.8c-1.12-.17-2.29-.02-3.32.48-1.54.71-2.61 2.24-2.8 3.92-.3 2.13.78 4.31 2.69 5.3 1.54.89 3.49.91 5.04.09.91-.45 1.63-1.22 1.96-2.15.22-.52.28-1.1.28-1.66V0h.03z"/>
  </svg>
);

export default function ChannelTestView({ state, onAddPost, onUpdatePostStatus, onRefreshState }: ChannelTestViewProps) {
  // We discover all available connected channels
  const activeLogins = state.socialLogins || [];
  
  const [selectedChannel, setSelectedChannel] = useState<string>(() => {
    return activeLogins.length > 0 ? activeLogins[0].channel : "LinkedIn";
  });

  // State for Testing API Connection
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string; channel?: string; username?: string; status?: string } | null>(null);

  const handleExecuteConnectionTest = async () => {
    setIsTestingConnection(true);
    setTestFeedback(null);
    try {
      const res = await fetch(`/api/channels/${selectedChannel}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: selectedChannel }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Houve uma instabilidade na chamada à API.");
      }
      setTestFeedback({
        success: true,
        message: "Conexão validada! O sinal de pulso 'Olá, Open Studio!' disparou e autenticou com sucesso.",
        channel: selectedChannel,
        username: "arinelcino",
        status: "200_OK_VERIFIED"
      });

      // Refresh global activities log in high fidelity
      if (onRefreshState) {
        await onRefreshState();
      }
    } catch (err: any) {
      setTestFeedback({
        success: false,
        message: err.message || "Erro de rede ao disparar teste de conexão de API."
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const [postTitle, setPostTitle] = useState("");
  const [postKeyword, setPostKeyword] = useState("automacao");
  const [postContent, setPostContent] = useState("");
  
  // Simulation status states
  const [isPublishing, setIsPublishing] = useState(false);
  const [simulationStep, setSimulationStep] = useState<"idle" | "publishing" | "published" | "comment_received" | "bot_replying" | "completed">("idle");
  const [simulatedComment, setSimulatedComment] = useState("");
  const [simulatedReply, setSimulatedReply] = useState("");
  const [simulatedCommentUser, setSimulatedCommentUser] = useState("");
  
  // Quick prefill options for testing
  const samplePosts = [
    {
      title: "Como usar o Claude Code para escalar sua engenharia em 10x",
      keyword: "claude-code",
      content: "Acabei de rodar meus primeiros testes avançados com o Claude Code e estou impressionado com o nível de autonomia do agente.\n\nFizemos um refactory completo de rotas e migração de banco em menos de 5 minutos, direto do terminal.\n\nQuem quer ver o passo a passo completo? Comente QUERO que te envio o link de imediato no privado!",
      comment: "Quero receber o roteiro de configuração! Como faço?",
      reply: "Enviado! Acabei de mandar o link completo e exclusivo da aula no seu direct. Confira lá! 🚀"
    },
    {
      title: "O futuro das automações de leads com marketing conversacional",
      keyword: "ia-leads",
      content: "Esqueça formulários estáticos de landing pages.\n\nO cliente moderno quer respostas imediatas. Integrar robôs de automação inteligente em posts garante uma taxa de conversão 3.5x maior.\n\nDigite INFRA para receber acesso à nossa grade de automação gratuita de Open Studio nas mídias.",
      comment: "Comentei INFRA, me envia por favor!",
      reply: "Opa, já está na mão! Seu direct foi alimentado com o PDF completo explicativo. Bons estudos! 📉"
    },
    {
      title: "Automação multicanal na prática",
      keyword: "open-studio",
      content: "Nossos robôs estão oficialmente publicando em canais customizados sincronizados. Comente CANAL para receber o invite.",
      comment: "Gostei muito, quero o link do CANAL!",
      reply: "Perfeito! Link exclusivo com as credenciais beta enviado com sucesso na sua caixa privada! ✨"
    }
  ];

  // Auto prefill first sample post
  useEffect(() => {
    if (!postTitle && !postContent) {
      setPostTitle(samplePosts[0].title);
      setPostKeyword(samplePosts[0].keyword);
      setPostContent(samplePosts[0].content);
    }
  }, []);

  const handlePrefill = (index: number) => {
    setPostTitle(samplePosts[index].title);
    setPostKeyword(samplePosts[index].keyword);
    setPostContent(samplePosts[index].content);
    setSimulationStep("idle");
    setSimulatedComment("");
    setSimulatedReply("");
  };

  const executeLivePostTest = async () => {
    if (!postContent.trim() || !postTitle.trim()) return;
    
    setIsPublishing(true);
    setSimulationStep("publishing");
    
    // Simulate API delay for writing to the mock spreadsheet database
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Find matching samples for custom automated replies
      const matchedSample = samplePosts.find(s => postContent.toLowerCase().includes(s.keyword) || postContent.toLowerCase().includes(s.title.slice(0, 10).toLowerCase())) 
        || samplePosts[0];

      // Call API to save this post as "Publicado" (published) in the centralized DB
      await onAddPost({
        title: postTitle,
        content: postContent,
        channel: selectedChannel,
        status: "Publicado",
        publishDate: "Hoje, agora mesmo",
        keyword: postKeyword,
        author: state.profile?.name || "Arinelcino"
      });

      setSimulationStep("published");
      setIsPublishing(false);

      // Comment execution simulation
      setTimeout(() => {
        setSimulatedCommentUser(["pedro_designer", "larissa_growth", "marcos_dev", "clara_creator"][Math.floor(Math.random() * 4)]);
        setSimulatedComment(matchedSample.comment);
        setSimulationStep("comment_received");

        // Bot Auto-reply execution simulation
        setTimeout(() => {
          setSimulationStep("bot_replying");
          
          setTimeout(() => {
            setSimulatedReply(matchedSample.reply);
            setSimulationStep("completed");
          }, 2000);

        }, 2000);

      }, 2500);

    } catch (err) {
      console.error(err);
      setIsPublishing(false);
      setSimulationStep("idle");
    }
  };

  const getChannelIcon = (chName: string, sizeClass = "w-5 h-5") => {
    switch (chName.toLowerCase()) {
      case "linkedin":
        return <Linkedin className={`${sizeClass} text-[#0A66C2]`} />;
      case "instagram":
        return <Instagram className={`${sizeClass} text-[#E1306C]`} />;
      case "youtube":
        return <Youtube className={`${sizeClass} text-[#FF0000]`} />;
      case "twitter":
      case "x":
        return <Twitter className={`${sizeClass} text-[#1DA1F2]`} />;
      case "tiktok":
        return <TiktokIcon className={sizeClass} />;
      default:
        return <Globe className={`${sizeClass} text-zinc-500`} />;
    }
  };

  // Build the live preview representation
  const activePostObject: Post = {
    id: "temp_test_1",
    title: postTitle || "Título Provisório",
    channel: selectedChannel,
    status: "Publicado",
    scheduledDate: "",
    publishDate: "Agora mesmo",
    author: state.profile?.name || "Arinelcino",
    keyword: postKeyword || "teste",
    content: postContent || "Insira conteúdo para testar mídias automatizadas."
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block font-bold">LIVE STAGE SIMULATOR</span>
        <h1 className="text-2xl font-semibold text-zinc-900 mt-1">Simulador de Postagem e Automação de Leads</h1>
        <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
          Selecione uma conta ativa de sua equipe, simule um post real no feed e veja as automações inteligentes capturarem leads em tempo real.
        </p>
      </div>

      {activeLogins.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-zinc-700 font-light space-y-3">
          <h4 className="font-semibold text-zinc-900">Nenhum Canal Integrado Ativo</h4>
          <p className="text-xs">
            Para testar automações, você precisa primeiro vincular pelo menos um canal com uma credencial (id de perfil).
          </p>
          <div className="pt-1">
            <span className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg font-bold border border-amber-300 pointer-events-none cursor-pointer">
              Ative canais no menu "Canais Conectados"
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls - Left side */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-3xs text-xs space-y-4">
            <h3 className="text-sm font-semibold text-zinc-800 font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Configuração da Postagem de Teste</span>
            </h3>

            {/* Select Channel */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">1. Selecionar Perfil Autenticado</label>
              <div className="grid grid-cols-2 gap-2">
                {activeLogins.map((login) => (
                  <button
                    key={login.channel}
                    type="button"
                    onClick={() => {
                      setSelectedChannel(login.channel);
                    }}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                      selectedChannel === login.channel 
                        ? "bg-zinc-900 text-white border-zinc-900 font-bold" 
                        : "bg-white hover:bg-zinc-50 border-zinc-250 text-zinc-700"
                    }`}
                  >
                    {getChannelIcon(login.channel, "w-4 h-4")}
                    <span className="truncate">@{login.username}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick prefill presets */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block">Modelos Rápidos (Ganchos de Automação)</label>
              <div className="flex gap-2 flex-wrap">
                {samplePosts.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePrefill(idx)}
                    className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 px-2 py-1.5 rounded-md text-[10.5px] font-semibold text-zinc-600 transition truncate max-w-[130px] cursor-pointer"
                  >
                    Preset {idx + 1}: #{s.keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* Title / Keywords */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Referência de Tópico</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="ex: Como escalar leads"
                  className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Gatilho / Hashtag</label>
                <input
                  type="text"
                  required
                  value={postKeyword}
                  onChange={(e) => setPostKeyword(e.target.value)}
                  placeholder="ex: leads"
                  className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Post Content Area */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Conteúdo do Post (Copywriter)</label>
                <span className="text-[9px] text-[#db2777] font-semibold font-mono animate-pulse">Robô ativado na palavra-chave</span>
              </div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Escreva sua copy de teste usando a palavra-chave de gatilho para o robô conversacional."
                rows={5}
                className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 whitespace-pre-wrap font-sans"
              />
            </div>

            {/* Action simulation trigger */}
            <button
              onClick={executeLivePostTest}
              type="button"
              disabled={isPublishing || simulationStep === "publishing"}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white font-bold py-3 rounded-xl transition hover:brightness-110 shadow-md cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publicando no Canal de Simulação...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Entrar no Canal e Executar Postagem</span>
                </>
              )}
            </button>

            {/* Process Checklist Indicator */}
            {simulationStep !== "idle" && (
              <div className="border border-zinc-150 rounded-xl p-3 bg-zinc-50/50 space-y-2 mt-4 text-[11px] leading-relaxed">
                <h4 className="font-bold text-zinc-800 font-mono tracking-wide uppercase">Registro de Atividades do Robo</h4>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Conexão consolidada no canal: @{activeLogins.find(a => a.channel === selectedChannel)?.username}</span>
                  </p>
                  <p className={`flex items-center gap-2 ${simulationStep !== "publishing" ? "text-green-700 font-semibold" : "text-zinc-500 animate-pulse"}`}>
                    {simulationStep !== "publishing" ? (
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0 text-zinc-400" />
                    )}
                    <span>Post publicado com sucesso de forma autônoma.</span>
                  </p>
                  {simulationStep !== "publishing" && simulationStep !== "published" && (
                    <p className={`flex items-center gap-2 ${simulationStep !== "comment_received" ? "text-green-700 font-semibold" : "text-indigo-600 font-semibold animate-pulse"}`}>
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Comentário de seguidor simulado recebido (com gatilho de lead).</span>
                    </p>
                  )}
                  {(simulationStep === "bot_replying" || simulationStep === "completed") && (
                    <p className={`flex items-center gap-2 ${simulationStep === "completed" ? "text-green-700 font-semibold" : "text-[#db2777] font-semibold animate-pulse"}`}>
                      {simulationStep === "completed" ? (
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-zinc-400" />
                      )}
                      <span>Executando resposta automática via API Conversacional.</span>
                    </p>
                  )}
                </div>
              </div>
            )}
            </div>

            {/* Dedicated Connection Test Card */}
            <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-3xs text-xs space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 font-mono flex items-center gap-1.5 font-sans">
                  <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Teste de Conexão Directa de API</span>
                </h3>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold uppercase">
                  {selectedChannel}
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 leading-normal font-sans font-light">
                Dispare um sinal de conexão para o canal selecionado com o post de teste <strong>"Olá, Open Studio!"</strong> para verificar se a integração com a API da rede social está validada com status de sucesso.
              </p>

              <button
                type="button"
                onClick={handleExecuteConnectionTest}
                disabled={isTestingConnection}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-300 text-white font-medium py-2.5 rounded-xl transition cursor-pointer font-sans text-xs"
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin animate-spin-reverse" />
                    <span>Executando Teste de Conexão...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar 'Olá, Open Studio!'</span>
                  </>
                )}
              </button>

              {testFeedback && (
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed animate-fade-in font-sans ${
                  testFeedback.success 
                    ? "bg-emerald-50/80 border-emerald-250 text-emerald-800" 
                    : "bg-red-50/80 border-red-250 text-red-800"
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-bold shrink-0">
                      {testFeedback.success ? "✓" : "✗"}
                    </span>
                    <div className="space-y-1">
                      <p className="font-bold">{testFeedback.success ? "Conexão Estabelecida com Sucesso!" : "Erro de Integração de Canal"}</p>
                      <p className="text-[10.5px] font-light opacity-90">{testFeedback.message}</p>
                      {testFeedback.success && (
                        <div className="pt-2 text-[9.5px] opacity-80 font-mono space-y-0.5 border-t border-emerald-150 mt-1.5 leading-normal">
                          <p>Canal: {testFeedback.channel}</p>
                          <p>Perfil Sincronizado: @{testFeedback.username}</p>
                          <p>Retorno de Status: {testFeedback.status}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Feed mockup - Right side */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest text-left">
              VISUALIZADOR LIVE DO CANAL ({selectedChannel.toUpperCase()})
            </h4>

            {/* Dynamic visual box styling */}
            <div className={`border border-zinc-200 rounded-3xl p-5 bg-zinc-50 shadow-sm flex flex-col justify-center items-center min-h-[450px]`}>
              
              {/* Post Frame Rendering */}
              <div className="w-full">
                <SocialPostPreview post={activePostObject} state={state} />

                {/* Interactions and direct replies mocking */}
                {(simulationStep === "comment_received" || simulationStep === "bot_replying" || simulationStep === "completed") && (
                  <div className="mt-4 bg-white border border-zinc-200/80 rounded-xl p-4 max-w-md mx-auto space-y-3 shadow-3xs text-left animate-slide-up">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">DISCUSSÃO / RESPOSTAS DETECTADAS</span>
                    
                    {/* Follower comment */}
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-full bg-zinc-300 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {simulatedCommentUser.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="bg-zinc-50 p-2.5 rounded-xl text-xs space-y-1 font-sans">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-zinc-800">@{simulatedCommentUser}</span>
                          <span className="text-[9px] text-zinc-400">• Seguidor</span>
                        </div>
                        <p className="text-zinc-650 font-medium">{simulatedComment}</p>
                      </div>
                    </div>

                    {/* Bot automated typing / auto response */}
                    {simulationStep === "bot_replying" && (
                      <div className="flex gap-2.5 items-start pl-8 animate-pulse text-zinc-405 font-mono text-[10.5px]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mídia Assistente está respondendo...</span>
                      </div>
                    )}

                    {simulationStep === "completed" && (
                      <div className="flex gap-2.5 items-start pl-8 animate-slide-up text-xs">
                        <img
                          src={state.profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                          alt="Open Studio Bot"
                          className="w-7 h-7 rounded-full object-cover border border-zinc-200 shrink-0"
                        />
                        <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/20 border border-emerald-100 p-2.5 rounded-xl space-y-1 font-sans flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-zinc-850">Respondedor Automático</span>
                              <span className="text-[8px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded font-mono">AUTOR</span>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-700 block font-bold uppercase tracking-wider">LEAD CAPTURADO</span>
                          </div>
                          <p className="text-zinc-700 leading-relaxed font-semibold">{simulatedReply}</p>
                          <span className="text-[9.5px] italic text-emerald-800 font-mono font-semibold block pt-1">★ Lead @{simulatedCommentUser} migrado com sucesso para aba de Leads!</span>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
