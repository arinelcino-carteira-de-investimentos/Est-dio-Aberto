import React, { useState } from "react";
import { 
  useSocialStore, 
  SocialConnection 
} from "../store/socialStore";
import { 
  Linkedin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Twitter, 
  Settings2, 
  CheckCircle, 
  Trash2, 
  Loader2, 
  KeyRound, 
  Link2, 
  Globe 
} from "lucide-react";
import { AppState } from "../types";

interface ManageChannelsViewProps {
  state: AppState;
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

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "w-5 h-5"}
  >
    <path d="M12.24 0C5.58 0 0 5.58 0 12.24c0 5.11 3.17 9.47 7.68 11.23-.1-.95-.19-2.42.04-3.46.21-.93 1.34-5.68 1.34-5.68s-.34-.69-.34-1.71c0-1.6 1.48-2.79 2.82-2.79.88 0 1.29.66 1.29 1.45 0 2.01-1.28 5.01-1.94 7.79-.37 1.56.78 2.83 2.31 2.83 2.78 0 4.91-2.93 4.91-7.16 0-3.74-2.69-6.36-6.53-6.36-4.45 0-7.07 3.34-7.07 6.79 0 1.34.52 2.78 1.17 3.56.13.15.15.29.11.45l-.44 1.77c-.07.29-.23.35-.53.21-1.98-.92-3.21-3.81-3.21-6.13 0-4.99 3.63-9.57 10.45-9.57 5.49 0 9.75 3.91 9.75 9.13 0 5.45-3.43 9.84-8.2 9.84-1.6 0-3.11-.83-3.62-1.81l-.99 3.76c-.36 1.39-1.33 3.13-1.98 4.2C8.75 23.82 10.45 24 12.24 24 18.9 24 24 18.9 24 12.24 24 5.58 18.9 0 12.24 0z"/>
  </svg>
);

export default function ManageChannelsView({ state, onRefreshState }: ManageChannelsViewProps) {
  const { socialConnections, addConnection, removeConnection } = useSocialStore();
  const [activeConfigChannel, setActiveConfigChannel] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Input states for dedicated forms
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [appId, setAppId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const channelsList = [
    { id: "LinkedIn", name: "LinkedIn Professional", icon: <Linkedin className="w-5 h-5 text-[#0A66C2]" />, color: "border-l-[#0A66C2]" },
    { id: "Instagram", name: "Instagram Business", icon: <Instagram className="w-5 h-5 text-[#E1306C]" />, color: "border-l-[#E1306C]" },
    { id: "Facebook", name: "Facebook Page API", icon: <Facebook className="w-5 h-5 text-[#1877F2]" />, color: "border-l-[#1877F2]" },
    { id: "TikTok", name: "TikTok Creator Hub", icon: <TiktokIcon className="w-5 h-5 text-[#000000]" />, color: "border-l-black" },
    { id: "YouTube", name: "YouTube Creator Studio", icon: <Youtube className="w-5 h-5 text-[#FF0000]" />, color: "border-l-[#FF0000]" },
    { id: "Twitter", name: "Twitter / X Developer", icon: <Twitter className="w-5 h-5 text-[#1DA1F2]" />, color: "border-l-[#1DA1F2]" },
    { id: "Pinterest", name: "Pinterest Pro Boards", icon: <PinterestIcon className="w-5 h-5 text-[#BD081C]" />, color: "border-l-[#BD081C]" }
  ];

  const handleOpenConfig = (channelId: string) => {
    const existing = socialConnections.find((c) => c.channel.toLowerCase() === channelId.toLowerCase());
    setActiveConfigChannel(channelId);
    setErrorMsg("");
    setSuccessMsg("");
    
    if (existing) {
      setUsername(existing.username);
      setToken(existing.token);
      setApiUrl(existing.apiUrl || "");
      setAppId(existing.appId || "");
      setClientSecret(existing.clientSecret || "");
    } else {
      setUsername("");
      setToken("");
      setApiUrl("");
      setAppId("");
      setClientSecret("");
    }
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfigChannel) return;
    if (!username.trim() || !token.trim()) {
      setErrorMsg("O identificador do perfil e o Token de acesso são obrigatórios.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Save connection in Zustand (local storage persistence)
      const connectionData: SocialConnection = {
        channel: activeConfigChannel,
        username: username.trim(),
        token: token.trim(),
        apiUrl: apiUrl.trim() || undefined,
        appId: appId.trim() || undefined,
        clientSecret: clientSecret.trim() || undefined,
        connectedAt: new Date().toLocaleDateString("pt-BR")
      };
      
      addConnection(connectionData);

      // 2. Synchronize with high fidelity backend local state via API call
      const res = await fetch("/api/social/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: activeConfigChannel,
          username: username.trim()
        })
      });

      if (!res.ok) {
        throw new Error("Erro de resposta ao sincronizar as conexões no servidor central.");
      }

      setSuccessMsg(`Canal ${activeConfigChannel} configurado de forma síncrona com sucesso! JWT e credenciais gravados no Zustand.`);
      
      if (onRefreshState) {
        await onRefreshState();
      }

      // Close state
      setTimeout(() => {
        setActiveConfigChannel(null);
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Erro inesperado ao salvar tokens. Verifique os dados fornecidos.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (channelId: string) => {
    if (!confirm(`Deseja mesmo revogar as chaves e desconectar canal ${channelId}?`)) return;

    try {
      // 1. Remove from Zustand store
      removeConnection(channelId);

      // 2. Delete from backend local state via API call
      const res = await fetch("/api/social/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: channelId })
      });

      if (!res.ok) {
        throw new Error("Erro ao reportar revogação de chaves ao servidor central.");
      }

      setSuccessMsg(`Canal ${channelId} desconectado e chaves limpas.`);
      if (activeConfigChannel === channelId) {
        setActiveConfigChannel(null);
      }

      if (onRefreshState) {
        await onRefreshState();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Não foi possível revogar a credencial no servidor.");
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
        <Settings2 className="w-5 h-5 text-zinc-650" />
        <div>
          <h2 className="text-base font-semibold text-zinc-900 leading-none">Gerenciador de Mídias e Credenciais de APIs</h2>
          <p className="text-[11.5px] text-zinc-400 mt-1">Conecte e configure credenciais de API exclusivas para automações multicanal.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-150 text-red-800 rounded-xl text-xs animate-fade-in font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* List of Channels */}
        <div className="space-y-2">
          {channelsList.map((ch) => {
            const isConnected = socialConnections.some(
              (c) => c.channel.toLowerCase() === ch.id.toLowerCase()
            );
            const connectionInfo = socialConnections.find(
              (c) => c.channel.toLowerCase() === ch.id.toLowerCase()
            );

            return (
              <div 
                key={ch.id} 
                className={`bg-white border hover:bg-zinc-50 border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between transition cursor-pointer border-l-4 ${ch.color}`}
                onClick={() => handleOpenConfig(ch.id)}
              >
                <div className="flex items-center gap-3">
                  {ch.icon}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 leading-tight">{ch.name}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-none">
                      {isConnected 
                        ? `Conectado como @${connectionInfo?.username} (${connectionInfo?.connectedAt})` 
                        : "Não configurado"
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleOpenConfig(ch.id)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition hover:bg-zinc-100 ${
                      activeConfigChannel === ch.id 
                        ? "bg-zinc-100 border-zinc-300 text-zinc-900" 
                        : "bg-white border-zinc-200 text-zinc-700"
                    }`}
                  >
                    Configurar
                  </button>

                  {isConnected && (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(ch.id)}
                      className="p-1 text-red-650 hover:bg-red-50 rounded-lg transition"
                      title="Desconectar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration Panel - Right side */}
        <div className="bg-zinc-50 border border-zinc-250 p-5 rounded-3xl min-h-[300px] flex flex-col justify-start">
          {activeConfigChannel ? (
            <form onSubmit={handleSaveConnection} className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-bold text-slate-800 text-xs font-mono uppercase tracking-wide">
                  Chaves de Integração: {activeConfigChannel}
                </span>
                <span className={`text-[8.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                  socialConnections.some(c => c.channel.toLowerCase() === activeConfigChannel.toLowerCase())
                    ? "bg-emerald-100 text-emerald-800 animate-pulse"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {socialConnections.some(c => c.channel.toLowerCase() === activeConfigChannel.toLowerCase()) ? "✔ ATIVO" : "⚡ FILA"}
                </span>
              </div>

              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-zinc-450 uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Identificador ou Nome de Usuário (@perfil)</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: openstudio_agency"
                  className="w-full text-xs text-zinc-750 bg-white border border-zinc-250 rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-medium"
                />
              </div>

              {/* Token Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-zinc-450 uppercase flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Bearer Access Token / JWT Secret</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full text-xs text-zinc-750 bg-white border border-zinc-250 rounded-xl p-3 pr-10 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-mono text-[10px]"
                  />
                </div>
              </div>

              {/* Advanced toggle fields only for deep API connections */}
              <div className="space-y-2.5 pt-1.5 border-t border-zinc-200">
                <span className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Credenciais do App Developer (Opcionais)</span>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-mono font-bold text-zinc-405 uppercase block">API Base URL</label>
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.linkedin.com/v2"
                      className="w-full text-[10.5px] text-zinc-700 bg-white border border-zinc-250 rounded-lg p-2 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-mono font-bold text-zinc-405 uppercase block">Client Key / App ID</label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="app_cli_839174"
                      className="w-full text-[10.5px] text-zinc-700 bg-white border border-zinc-250 rounded-lg p-2 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8.5px] font-mono font-bold text-zinc-405 uppercase block">App Client Secret Key</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full text-[10.5px] text-zinc-700 bg-white border border-zinc-250 rounded-lg p-2 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-300 text-white font-bold py-3 rounded-xl transition cursor-pointer font-sans text-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando Tokens...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Salvar Credencial</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConfigChannel(null)}
                  className="bg-white hover:bg-zinc-100 border border-zinc-250 text-zinc-700 font-semibold px-4 rounded-xl transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <Settings2 className="w-10 h-10 text-zinc-300 stroke-1 mb-2.5 animate-pulse" />
              <p className="text-[11.5px] leading-relaxed max-w-[200px] font-light">
                Selecione um canal social na mídias à esquerda para gerenciar Bearer Tokens e Chaves Developer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
