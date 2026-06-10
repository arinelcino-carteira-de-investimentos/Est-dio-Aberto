import React, { useState } from "react";
import { 
  Linkedin, 
  Instagram, 
  Youtube, 
  Twitter, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Link2, 
  Unlink,
  AlertCircle,
  Facebook,
  Globe,
  Radio,
  Tv,
  MessageSquare,
  Hash
} from "lucide-react";
import { AppState } from "../types";

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.84 2.19 1.4 3.48 1.62V9.7c-1.39-.17-2.73-.75-3.82-1.63-.09-.07-.15-.19-.18-.3-.02 1.49-.01 2.99-.02 4.48-.06 2.05-.62 4.12-1.8 5.75-1.52 2.21-4.04 3.65-6.73 3.84-2.58.26-5.28-.6-7.14-2.42C-.17 17.51-1.07 14.15-.4 10.97c.52-2.77 2.45-5.22 5.09-6.32 1.42-.64 2.99-.9 4.54-.79V7.8c-1.12-.17-2.29-.02-3.32.48-1.54.71-2.61 2.24-2.8 3.92-.3 2.13.78 4.31 2.69 5.3 1.54.89 3.49.91 5.04.09.91-.45 1.63-1.22 1.96-2.15.22-.52.28-1.1.28-1.66V0h.03z"/>
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M12.24 0C5.58 0 0 5.58 0 12.24c0 5.11 3.17 9.47 7.68 11.23-.1-.95-.19-2.42.04-3.46.21-.93 1.34-5.68 1.34-5.68s-.34-.69-.34-1.71c0-1.6 1.48-2.79 2.82-2.79.88 0 1.29.66 1.29 1.45 0 2.01-1.28 5.01-1.94 7.79-.37 1.56.78 2.83 2.31 2.83 2.78 0 4.91-2.93 4.91-7.16 0-3.74-2.69-6.36-6.53-6.36-4.45 0-7.07 3.34-7.07 6.79 0 1.34.52 2.78 1.17 3.56.13.15.15.29.11.45l-.44 1.77c-.07.29-.23.35-.53.21-1.98-.92-3.21-3.81-3.21-6.13 0-4.99 3.63-9.57 10.45-9.57 5.49 0 9.75 3.91 9.75 9.13 0 5.45-3.43 9.84-8.2 9.84-1.6 0-3.11-.83-3.62-1.81l-.99 3.76c-.36 1.39-1.33 3.13-1.98 4.2C8.75 23.82 10.45 24 12.24 24 18.9 24 24 18.9 24 12.24 24 5.58 18.9 0 12.24 0z"/>
  </svg>
);

interface SocialConnectionsProps {
  state: AppState;
  onConnect: (channel: string, username: string) => Promise<void>;
  onDisconnect: (channel: string) => Promise<void>;
}

export default function SocialConnectionsView({ state, onConnect, onDisconnect }: SocialConnectionsProps) {
  const [connectingChannel, setConnectingChannel] = useState<string | null>(null);
  const [inputUsername, setInputUsername] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Custom Channel Modal States
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customChannelName, setCustomChannelName] = useState("");
  const [customUsername, setCustomUsername] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customIcon, setCustomIcon] = useState("Globe");

  const [customDescSaved, setCustomDescSaved] = useState<Record<string, string>>(() => {
    const keys = Object.keys(localStorage);
    const result: Record<string, string> = {};
    keys.forEach(k => {
      if (k.startsWith("custom_desc_")) {
        result[k.replace("custom_desc_", "")] = localStorage.getItem(k) || "";
      }
    });
    return result;
  });

  const [customIconSaved, setCustomIconSaved] = useState<Record<string, string>>(() => {
    const keys = Object.keys(localStorage);
    const result: Record<string, string> = {};
    keys.forEach(k => {
      if (k.startsWith("custom_icon_")) {
        result[k.replace("custom_icon_", "")] = localStorage.getItem(k) || "";
      }
    });
    return result;
  });

  const networks = [
    {
      id: "LinkedIn",
      name: "LinkedIn Pro",
      color: "#0A66C2",
      icon: <Linkedin className="w-5 h-5 text-[#0A66C2]" />,
      placeholder: "ex: arinelcino-linkedin",
      desc: "Automação para postagens de liderança intelectual e newsletters profissionais."
    },
    {
      id: "Instagram",
      name: "Instagram Business",
      color: "#E1306C",
      icon: <Instagram className="w-5 h-5 text-[#E1306C]" />,
      placeholder: "ex: @arinelcino",
      desc: "Agendamento visual de carrosséis e respostas diretas automáticas nas DMs."
    },
    {
      id: "TikTok",
      name: "TikTok Creator",
      color: "#000000",
      icon: <TiktokIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />,
      placeholder: "ex: @arinelcino_dev",
      desc: "Coleta de tendências rápidas e roteirização assistida com ganchos de alta retenção."
    },
    {
      id: "YouTube",
      name: "YouTube Shorts",
      color: "#FF0000",
      icon: <Youtube className="w-5 h-5 text-[#FF0000]" />,
      placeholder: "ex: arinelcinotech",
      desc: "Distribuição inteligente e otimização automatizada de tags de retenção."
    },
    {
      id: "Twitter",
      name: "Twitter / X",
      color: "#1DA1F2",
      icon: <Twitter className="w-5 h-5 text-[#1DA1F2]" />,
      placeholder: "ex: @arinel_oficial",
      desc: "Distribuição expressa de tweets e threads de engenharia em tempo real."
    },
    {
      id: "Facebook",
      name: "Facebook Fan Page",
      color: "#1877F2",
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
      placeholder: "ex: arinelcinofanpage",
      desc: "Publicações dinâmicas e engajamento automatizado em páginas institucionais."
    },
    {
      id: "Pinterest",
      name: "Pinterest Pro Boards",
      color: "#BD081C",
      icon: <PinterestIcon className="w-5 h-5 text-[#BD081C]" />,
      placeholder: "ex: @arinelcino_ideas",
      desc: "Pins gerados que ranqueiam no motor do Google de forma perene com alto engajamento visual."
    }
  ];

  const standardNetworkIds = ["linkedin", "instagram", "tiktok", "youtube", "twitter", "facebook", "pinterest"];
  
  // Look for any connected logins in state that are not in our standardNetworkIds list
  const customLogins = (state.socialLogins || []).filter(
    (log) => !standardNetworkIds.includes(log.channel.toLowerCase())
  );

  const getCustomIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Radio":
        return <Radio className="w-5 h-5 text-purple-600" />;
      case "Tv":
        return <Tv className="w-5 h-5 text-blue-600" />;
      case "MessageSquare":
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case "Hash":
        return <Hash className="w-5 h-5 text-orange-600" />;
      default:
        return <Globe className="w-5 h-5 text-indigo-600" />;
    }
  };

  const dynamicNetworks = [
    ...networks,
    ...customLogins.map((login) => {
      const savedIconName = customIconSaved[login.channel] || "Globe";
      return {
        id: login.channel,
        name: `${login.channel} Custom`,
        color: "#6B7280",
        icon: getCustomIconComponent(savedIconName),
        placeholder: "ex: id_do_canal",
        desc: customDescSaved[login.channel] || "Canal customizado registrado ativamente para automação de posts e mídias sociais."
      };
    })
  ];

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingChannel || !inputUsername.trim()) return;

    setLoadingAction(true);
    setErrorText("");
    try {
      await onConnect(connectingChannel, inputUsername.trim());
      setInputUsername("");
      setConnectingChannel(null);
    } catch (err: any) {
      setErrorText(err.message || "Erro ao conectar conta.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCustomChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChannelName.trim() || !customUsername.trim()) return;

    setLoadingAction(true);
    setErrorText("");
    try {
      // Save description and icon in localStorage
      localStorage.setItem("custom_desc_" + customChannelName.trim(), customDescription.trim() || "Canal customizado registrado para automação.");
      localStorage.setItem("custom_icon_" + customChannelName.trim(), customIcon);

      // Sync custom state immediately
      setCustomDescSaved(prev => ({
        ...prev,
        [customChannelName.trim()]: customDescription.trim() || "Canal customizado registrado para automação."
      }));
      setCustomIconSaved(prev => ({
        ...prev,
        [customChannelName.trim()]: customIcon
      }));

      // Map to socialLogins
      await onConnect(customChannelName.trim(), customUsername.trim());

      setCustomChannelName("");
      setCustomUsername("");
      setCustomDescription("");
      setCustomIcon("Globe");
      setIsCustomModalOpen(false);
    } catch (err: any) {
      setErrorText(err.message || "Erro ao cadastrar novo canal.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnlink = async (channel: string) => {
    setLoadingAction(true);
    try {
      await onDisconnect(channel);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">GERENCIADOR DE CANAIS</span>
          <h1 className="text-2xl font-semibold text-zinc-900 mt-1">Configuração de Canais Conectados</h1>
          <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
            Vincule e configure os canais de mídias que alimentam as campanhas do Open Studio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorText("");
            setIsCustomModalOpen(true);
          }}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Canal Customizado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dynamicNetworks.map((net) => {
          const connectedInfo = state.socialLogins?.find(
            (log) => log.channel.toLowerCase() === net.id.toLowerCase()
          );

          return (
            <div 
              key={net.id} 
              className={`bg-white border rounded-2xl p-5 shadow-3xs flex flex-col justify-between transition-all relative overflow-hidden ${
                connectedInfo ? "border-emerald-200 ring-1 ring-emerald-50" : "border-zinc-200"
              }`}
            >
              {connectedInfo && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-0.5 uppercase tracking-wider">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Ativo</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-150">
                    {net.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">{net.id}</h3>
                    <h2 className="text-sm font-semibold text-zinc-800">{net.name}</h2>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed font-light">
                  {net.desc}
                </p>

                {connectedInfo ? (
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-emerald-700 block uppercase font-bold">Autenticado como</span>
                      <span className="text-xs font-semibold text-zinc-800">@{connectedInfo.username}</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-mono">Desde: {connectedInfo.connectedAt}</span>
                  </div>
                ) : (
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150 text-[11px] text-zinc-400 italic font-light">
                    Sem credencial cadastrada para este canal.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-zinc-105 flex items-center justify-between">
                {connectedInfo ? (
                  <button
                    type="button"
                    onClick={() => handleUnlink(net.id)}
                    disabled={loadingAction}
                    className="text-[10px] uppercase tracking-wider font-bold text-red-650 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition cursor-pointer"
                  >
                    <Unlink className="w-3 h-3" />
                    <span>Desvincular</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setConnectingChannel(net.id);
                      setInputUsername("");
                      setErrorText("");
                    }}
                    disabled={loadingAction}
                    className="text-[10px] uppercase tracking-wider font-semibold text-zinc-800 bg-white hover:bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 transition flex items-center gap-1.5 shadow-3xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-650" />
                    <span>Cadastrar Conta</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Link Modal */}
      {connectingChannel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Vincular Nova Credencial</span>
              <button 
                type="button" 
                onClick={() => setConnectingChannel(null)}
                className="text-zinc-400 hover:text-zinc-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">Preencha os dados da conta {connectingChannel}</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">Isso realiza o registro da conta com o token simulado de integração.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Username / ID da página</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 text-xs font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    placeholder={dynamicNetworks.find(n => n.id === connectingChannel)?.placeholder}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 pl-7 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {errorText && (
                <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errorText}</span>
                </p>
              )}

              <div className="pt-2 flex justify-end gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setConnectingChannel(null)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <span>{loadingAction ? "Cadastrando..." : "Confirmar Vínculo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Custom Channel Register Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-in p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Cadastrar Novo Canal Customizado</span>
              <button 
                type="button" 
                onClick={() => setIsCustomModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomChannelSubmit} className="space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">Novo Canal Customizado</h3>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                  Crie canais fictícios ou novos gateways (ex: Medium, Slack, Discord, WhatsApp) para organizar suas estratégias de conteúdo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Nome do Canal</label>
                  <input
                    type="text"
                    required
                    value={customChannelName}
                    onChange={(e) => setCustomChannelName(e.target.value)}
                    placeholder="ex: Medium"
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Conta Username/ID</label>
                  <input
                    type="text"
                    required
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="ex: arinelcino_tech"
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase">Descrição do Canal</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Descreva o propósito deste canal inteligente e como ele atuará com robôs de postagem."
                  rows={2}
                  className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">Estilo de Ícone</label>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[
                    { id: "Globe", label: "Globe" },
                    { id: "Radio", label: "Radio" },
                    { id: "Tv", label: "Tv" },
                    { id: "MessageSquare", label: "Bubble" },
                    { id: "Hash", label: "Tag" }
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setCustomIcon(ic.id)}
                      className={`py-2 px-1.5 rounded-lg border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                        customIcon === ic.id
                          ? "bg-zinc-900 text-white border-zinc-900 font-bold"
                          : "bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border-zinc-200"
                      }`}
                    >
                      <span className="scale-75">{getCustomIconComponent(ic.id)}</span>
                      <span className="text-[8px]">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {errorText && (
                <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errorText}</span>
                </p>
              )}

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <span>{loadingAction ? "Cadastrando..." : "Cadastrar Canal"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
