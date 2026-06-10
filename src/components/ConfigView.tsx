import React, { useState, useMemo, useEffect } from "react";
import { 
  Settings, 
  User, 
  Hash, 
  Terminal, 
  Volume2, 
  Save, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  Server, 
  Trash2,
  Cpu,
  RefreshCw,
  Moon,
  Sun
} from "lucide-react";
import { AppState, Webhook, HashtagGroup } from "../types";
import ManageChannelsView from "./ManageChannelsView";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

function LogAuditoria() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from("audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        if (data) {
          setLogs(data);
          return;
        }
      }
      
      const res = await fetch("/api/audits");
      const result = await res.json();
      if (res.ok && result.success && result.audits) {
        setLogs(result.audits.map((a: any) => ({
          id: a.id,
          usuario_email: a.user || "arinelcino@gmail.com",
          acao: a.action,
          entidade: "ERP",
          created_at: a.timestamp,
          detalhes: { details: a.details, severity: a.severity }
        })));
      }
    } catch (err) {
      console.error("[Fetch Audit Log Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const s = searchTerm.toLowerCase();
    return logs.filter(l => 
      String(l.acao || "").toLowerCase().includes(s) || 
      String(l.usuario_email || "").toLowerCase().includes(s) || 
      String(l.detalhes?.details || l.detalhes || "").toLowerCase().includes(s)
    );
  }, [logs, searchTerm]);

  return (
    <div className="bg-zinc-950 border border-[#D4AF37]/35 rounded-xl overflow-hidden shadow-2xl text-left mt-6">
      <div className="p-5 border-b border-[#D4AF37]/30 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest uppercase font-mono">
              LOG DE AUDITORIA (Supabase Sync)
            </h2>
            <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
              Rastreabilidade total das interações e execuções críticas.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 font-sans">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 focus:border-[#D4AF37] text-white text-xs px-3 py-1.5 pl-8 rounded-lg outline-none w-48 font-medium placeholder-zinc-500"
            />
            <svg className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 border border-zinc-800 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg text-[#D4AF37] transition cursor-pointer"
            title="Atualizar Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800/80 text-zinc-400">
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Timestamp</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Usuário</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Ação / Evento</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Entidade</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Detalhes Técnicos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                  Carregando logs de auditoria...
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log: any) => {
                const detailsStr = typeof log.detalhes === "string" 
                  ? log.detalhes 
                  : (log.detalhes?.details || JSON.stringify(log.detalhes || ""));
                const severity = log.detalhes?.severity || "info";
                
                return (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-4 text-zinc-400 font-mono whitespace-nowrap">
                      {new Date(log.created_at || log.timestamp || new Date()).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 font-sans text-zinc-200 font-medium">
                      {log.usuario_email || "arinelcino@gmail.com"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        severity === "critical" 
                          ? "bg-red-950/40 text-red-400 border border-red-900/30" 
                          : severity === "warning" 
                          ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" 
                          : "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                      }`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{log.entidade || "ERP_ENGINE"}</td>
                    <td className="py-3 px-4 font-sans text-zinc-300 max-w-xs truncate" title={detailsStr}>
                      {detailsStr}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                  Nenhum log de auditoria encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ConfigViewProps {
  state: AppState;
  onUpdateProfile: (profile: any) => Promise<void>;
  onUpdateConfig: (config: any) => Promise<void>;
  onToggleTheme: (darkMode: boolean) => Promise<void>;
  onSelectActiveTheme: (themeId: "classic" | "ch3" | "uol" | "h2" | "refined_neon" | "sales_iq" | "cyber_matrix" | "forest_harmony" | "royal_velvet" | "carbon_brutalist") => Promise<void>;
  onModuleCleanup: (type: string) => Promise<void>;
  fullscreenMode: boolean;
  setFullscreenMode: (val: boolean) => void;
  onRefreshState?: () => Promise<void>;
}

export default function ConfigView({ state, onUpdateProfile, onUpdateConfig, onToggleTheme, onSelectActiveTheme, onModuleCleanup, fullscreenMode, setFullscreenMode, onRefreshState }: ConfigViewProps) {
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // Tab control state
  const [activeSubTab, setActiveSubTab] = useState<"geral" | "integracoes" | "hashtags" | "agendamento">("geral");

  // Webhooks state variables
  const [leadWebhook, setLeadWebhook] = useState<Webhook>({
    event: "lead_captured" as const,
    url: (state.config.webhooks || []).find(w => w.event === "lead_captured")?.url || "",
    payloadFormat: (state.config.webhooks || []).find(w => w.event === "lead_captured")?.payloadFormat || "JSON",
    enabled: (state.config.webhooks || []).find(w => w.event === "lead_captured")?.enabled || false
  });

  const [errorWebhook, setErrorWebhook] = useState<Webhook>({
    event: "automation_error" as const,
    url: (state.config.webhooks || []).find(w => w.event === "automation_error")?.url || "",
    payloadFormat: (state.config.webhooks || []).find(w => w.event === "automation_error")?.payloadFormat || "JSON",
    enabled: (state.config.webhooks || []).find(w => w.event === "automation_error")?.enabled || false
  });

  // Hashtag groups state variables
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>(
    state.config.hashtagGroups || [
      { id: "1", name: "#marketing", hashtags: "#marketing #socialmedia #digitalmarketing #seo" },
      { id: "2", name: "#ia", hashtags: "#artificialintelligence #machinelearning #automation #nocode" },
      { id: "3", name: "#startup", hashtags: "#startups #venturecapital #growthhacking #founder" }
    ]
  );
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupHashtags, setNewGroupHashtags] = useState("");

  // Smart Scheduling rule
  const [autoPublishScheduledEnabled, setAutoPublishScheduledEnabled] = useState(
    state.config.autoPublishScheduledEnabled !== false
  );

  // Profile forms
  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [role, setRole] = useState(state.profile.role);
  const [avatar, setAvatar] = useState(state.profile.avatar);

  // Company registration forms & math validation
  const [razaoSocial, setRazaoSocial] = useState(() => {
    return localStorage.getItem("nocode_company_name") || "NoCode StartUp S.A.";
  });
  const [cnpjValue, setCnpjValue] = useState(() => {
    return localStorage.getItem("nocode_company_cnpj") || "12.345.678/0001-95";
  });
  const [cnpjError, setCnpjError] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);

  const formatCNPJ = (value: string) => {
    const cleanNumbers = value.replace(/\D/g, "");
    const limitedDigits = cleanNumbers.slice(0, 14);
    
    let formatted = "";
    if (limitedDigits.length > 0) {
      formatted += limitedDigits.slice(0, 2);
    }
    if (limitedDigits.length > 2) {
      formatted += "." + limitedDigits.slice(2, 5);
    }
    if (limitedDigits.length > 5) {
      formatted += "." + limitedDigits.slice(5, 8);
    }
    if (limitedDigits.length > 8) {
      formatted += "/" + limitedDigits.slice(8, 12);
    }
    if (limitedDigits.length > 12) {
      formatted += "-" + limitedDigits.slice(12, 14);
    }
    return formatted;
  };

  const validateCNPJChecksum = (cnpjVal: string): boolean => {
    const cleanRegex = cnpjVal.replace(/\D/g, "");
    if (cleanRegex.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleanRegex)) return false;

    // Validate first digit
    let size = cleanRegex.length - 2;
    let numbers = cleanRegex.substring(0, size);
    const digits = cleanRegex.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Validate second digit
    size = size + 1;
    numbers = cleanRegex.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCNPJ(raw);
    setCnpjValue(formatted);

    const checkDigits = formatted.replace(/\D/g, "");
    if (checkDigits.length === 0) {
      setCnpjError("");
    } else if (checkDigits.length < 14) {
      setCnpjError("Digite os 14 algarismos do CNPJ.");
    } else {
      const isValid = validateCNPJChecksum(formatted);
      if (isValid) {
        setCnpjError("");
      } else {
        setCnpjError("Dígitos verificadores inválidos (Checksum falhou).");
      }
    }
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checkDigits = cnpjValue.replace(/\D/g, "");
    if (checkDigits.length < 14) {
      setCnpjError("Sua empresa precisa de um CNPJ completo para salvar.");
      return;
    }
    if (!validateCNPJChecksum(cnpjValue)) {
      setCnpjError("Erro de integridade CNPJ (checksum matemático falhou).");
      return;
    }

    setSavingCompany(true);
    setCompanySaved(false);
    setTimeout(() => {
      localStorage.setItem("nocode_company_name", razaoSocial);
      localStorage.setItem("nocode_company_cnpj", cnpjValue);
      setSavingCompany(false);
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 2000);
    }, 1200);
  };

  // Config forms
  const [defaultHashtags, setDefaultHashtags] = useState(state.config.defaultHashtags);
  const [toneOfVoice, setToneOfVoice] = useState(state.config.toneOfVoice);
  const [fixedGenerationTime, setFixedGenerationTime] = useState(state.config.fixedGenerationTime || "09:00");
  const [automationActive, setAutomationActive] = useState(state.config.automationActive !== false);
  const [timezone, setTimezone] = useState(state.config.timezone || "America/Sao_Paulo");
  const [automationTasks, setAutomationTasks] = useState<string[]>(
    state.config.automationTasks || ["generation", "leadsAuto"]
  );

  // Notification Forms
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(state.config.emailNotificationsEnabled !== false);
  const [notificationEmail, setNotificationEmail] = useState(state.config.notificationEmail || "arinelcino@gmail.com");
  const [notifyOnCampaignComplete, setNotifyOnCampaignComplete] = useState(state.config.notifyOnCampaignComplete !== false);
  const [notifyOnErrorCritical, setNotifyOnErrorCritical] = useState(state.config.notifyOnErrorCritical !== false);

  const [activeLogs, setActiveLogs] = useState(state.activityLogs);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      await onUpdateProfile({ name, email, role, avatar });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2005);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingConfig(true);
    setConfigSaved(false);
    try {
      await onUpdateConfig({ 
        defaultHashtags, 
        toneOfVoice,
        fixedGenerationTime,
        automationActive,
        automationTasks,
        timezone,
        emailNotificationsEnabled,
        notificationEmail,
        notifyOnCampaignComplete,
        notifyOnErrorCritical,
        webhooks: [leadWebhook, errorWebhook],
        hashtagGroups,
        autoPublishScheduledEnabled
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 2005);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleClearLogs = () => {
    setActiveLogs([]);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header section */}
      <div className="border-b border-zinc-100 pb-5">
        <span className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">
          PLATAFORMA · CONFIGURAÇÕES DO SISTEMA
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1 pb-1">
          Configurações
        </h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium leading-relaxed">
          Ajuste as definições de perfil de {state.profile.name || "sua conta"}, adicione webhooks, crie categorias de autopublicação de hashtags, gerencie as grades de agendamentos e audite os logs de depuração.
        </p>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-zinc-200 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("geral")}
          type="button"
          className={`px-4 py-2.5 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "geral"
              ? "border-zinc-900 text-zinc-900 bg-zinc-50 font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Perfil & Geral
        </button>
        <button
          onClick={() => setActiveSubTab("integracoes")}
          type="button"
          className={`px-4 py-2.5 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "integracoes"
              ? "border-zinc-900 text-zinc-900 bg-zinc-50 font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Integrações Externas
        </button>
        <button
          onClick={() => setActiveSubTab("hashtags")}
          type="button"
          className={`px-4 py-2.5 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "hashtags"
              ? "border-zinc-900 text-zinc-900 bg-zinc-50 font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          Gestão de Hashtags
        </button>
        <button
          onClick={() => setActiveSubTab("agendamento")}
          type="button"
          className={`px-4 py-2.5 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "agendamento"
              ? "border-zinc-900 text-zinc-900 bg-zinc-50 font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-650 hover:border-zinc-300"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Agendamento Inteligente
        </button>
      </div>

      {/* Tab Content 1: Geral */}
      {activeSubTab === "geral" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Profile Card Section */}
            <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs flex flex-col justify-between text-left">
              <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-600" />
                <h2 className="text-sm font-bold text-zinc-800 tracking-wide uppercase font-mono">
                  Perfil do Administrador
                </h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-5 space-y-4 flex-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Nome de Exibição</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Email do Administrador</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs text-zinc-750 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Cargo na Startup</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Avatar URL Image</label>
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full text-xs text-zinc-500 bg-white border border-zinc-200 rounded-lg p-2.5 font-mono truncate focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-sm font-mono">
                    MATHEUS CASTELO ADMIN
                  </span>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-650 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {savingProfile ? (
                      <RefreshCw className="w-3 animate-spin text-white" />
                    ) : profileSaved ? (
                      <Check className="w-3 text-emerald-400 font-bold" />
                    ) : (
                      <Save className="w-3 text-white" />
                    )}
                    <span>{profileSaved ? "Salvo!" : "Salvar Perfil"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Empresa & Cadastro CNPJ ERP Card Section */}
            <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs flex flex-col justify-between text-left">
              <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                <Settings className="w-4 h-4 text-zinc-600" />
                <h2 className="text-sm font-bold text-zinc-800 tracking-wide uppercase font-mono">
                  Cadastro da Empresa ERP
                </h2>
              </div>

              <form onSubmit={handleCompanySubmit} className="p-5 space-y-4 flex-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Razão Social / Nome Fantasia</label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">CNPJ (Controlado por Checksum)</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={cnpjValue}
                    onChange={handleCnpjChange}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-zinc-900 focus:outline-hidden placeholder-zinc-300"
                  />
                  {cnpjError ? (
                    <span className="text-[10px] text-red-500 font-medium block">
                      ⚠ {cnpjError}
                    </span>
                  ) : cnpjValue ? (
                    <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                      ✓ CNPJ Válido! Algorítmo de dv verificado com sucesso.
                    </span>
                  ) : null}
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-sm font-mono uppercase tracking-wide font-semibold">
                    Atalho F4
                  </span>
                  <button
                    type="submit"
                    disabled={savingCompany}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {savingCompany ? (
                      <RefreshCw className="w-3 animate-spin text-white" />
                    ) : companySaved ? (
                      <Check className="w-3 text-emerald-400 font-bold" />
                    ) : (
                      <Save className="w-3 text-white" />
                    )}
                    <span>{companySaved ? "Salvo!" : "Atualizar CNPJ"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Copywriting General params Section */}
            <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs flex flex-col justify-between text-left">
              <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                <Hash className="w-4 h-4 text-zinc-600" />
                <h2 className="text-sm font-bold text-zinc-800 tracking-wide uppercase font-mono">
                  Diretivas de Escrita Comum de IA
                </h2>
              </div>

              <form onSubmit={handleConfigSubmit} className="p-5 space-y-4 flex-1">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Hashtags Padrão do Rodapé dos Posts</label>
                  <input
                    type="text"
                    value={defaultHashtags}
                    placeholder="#ia #nocode #automacao"
                    onChange={(e) => setDefaultHashtags(e.target.value)}
                    className="w-full text-xs placeholder:text-zinc-300 text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-zinc-400 italic block">
                    Separadas por espaços simples, sem vírgulas.
                  </span>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Domínio de Tom de Voz Preferido</label>
                  <select
                    value={toneOfVoice}
                    onChange={(e) => setToneOfVoice(e.target.value)}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg px-2.5 py-2.5 focus:outline-hidden"
                  >
                    <option value="Editorial / Profissional">Editorial / Profissional</option>
                    <option value="Técnico Avançado (Para Devs)">Técnico Avançado</option>
                    <option value="Mais Humilde / Direto">Mais Humilde / Direto</option>
                    <option value="Storytelling Visual Dinâmico">Storytelling NoCode</option>
                  </select>
                </div>

                <div className="space-y-1 bg-zinc-50 p-3 border border-zinc-150 rounded-lg text-xs leading-relaxed text-zinc-500 text-left">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-zinc-700 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                    CONEXÃO GOOGLE GENAI STATE:
                  </div>
                  <p className="text-[10px] font-medium pt-0.5">
                    Usando a biblioteca oficial do Google GenAI em conformidade com as diretrizes. A chave de segredo se conecta server-side no backend.
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold uppercase">API Conectada</span>
                  </div>
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-650 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {savingConfig ? (
                      <RefreshCw className="w-3 animate-spin text-white" />
                    ) : configSaved ? (
                      <Check className="w-3 text-emerald-400 font-bold" />
                    ) : (
                      <Save className="w-3 text-white" />
                    )}
                    <span>{configSaved ? "Salvo!" : "Salvar Configs"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Agendamento Automático de Postagens e IA (Daily Scheduler Daemon) */}
            <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs flex flex-col justify-between text-left">
              <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                <Server className="w-4 h-4 text-zinc-600" />
                <h2 className="text-sm font-bold text-zinc-800 tracking-wide uppercase font-mono">
                  Agendamento Diário de IA & Automação
                </h2>
              </div>

              <form onSubmit={handleConfigSubmit} className="p-5 space-y-4 flex-1 text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wide">AI_SCHEDULER_DAEMON</h3>
                      <h2 className="text-sm font-bold text-zinc-800">Automação de Geração Ativa</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutomationActive(!automationActive)}
                      className="focus:outline-hidden transition-all hover:scale-105 cursor-pointer"
                    >
                      {automationActive ? (
                        <ToggleRight className="w-8 h-8 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-zinc-300" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Quando ativo, a rotina de varredura automatizada lê os sinais do Radar de Tendências diariamente no horário estipulado para compor rascunhos de posts, reels e vídeos usando copywriting inteligente.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">
                    Horário Fixo de Disparo Diário
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="time"
                      value={fixedGenerationTime}
                      disabled={!automationActive}
                      onChange={(e) => setFixedGenerationTime(e.target.value)}
                      className="text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-400 focus:outline-hidden w-full sm:w-28"
                    />
                    <span className="text-[10px] text-zinc-400 border border-zinc-150 bg-zinc-50 rounded-lg px-3 py-2 flex items-center gap-1.5 font-medium leading-normal flex-1 font-sans">
                      <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                      Gera rascunhos com Gemini no fuso horário definido
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 text-left">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide block">
                    Fuso Horário Global de Automação
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden font-mono"
                  >
                    <option value="America/Sao_Paulo">America/Sao_Paulo (Horário de Brasília: GMT-3)</option>
                    <option value="America/Manaus">America/Manaus (GMT-4)</option>
                    <option value="America/Fortaleza">America/Fortaleza (GMT-3)</option>
                    <option value="America/Recife">America/Recife (GMT-3)</option>
                    <option value="Europe/Lisbon">Europe/Lisbon (Lisboa: GMT+1)</option>
                    <option value="UTC">UTC (Universal Time Coordinated: GMT+0)</option>
                  </select>
                  <p className="text-[9.5px] text-zinc-400 italic">As automações diárias e o agendamento de posts respeitarão este fuso horário real.</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-left">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide block font-mono">
                    Tarefas Executadas no Disparo Diário
                  </label>
                  <div className="space-y-2 pt-1 text-xs text-zinc-700 text-left">
                    <label className="flex items-center gap-2.5 cursor-pointer font-medium select-none font-sans">
                      <input
                        type="checkbox"
                        checked={automationTasks.includes("generation")}
                        disabled={!automationActive}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAutomationTasks([...automationTasks, "generation"]);
                          } else {
                            setAutomationTasks(automationTasks.filter(t => t !== "generation"));
                          }
                        }}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-zinc-905"
                      />
                      <span>Geração de posts por IA (Radar & Copywriting)</span>
                    </label>
                    
                    <label className="flex items-center gap-2.5 cursor-pointer font-medium select-none font-sans">
                      <input
                        type="checkbox"
                        checked={automationTasks.includes("leadsAuto")}
                        disabled={!automationActive}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAutomationTasks([...automationTasks, "leadsAuto"]);
                          } else {
                            setAutomationTasks(automationTasks.filter(t => t !== "leadsAuto"));
                          }
                        }}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-zinc-905"
                      />
                      <span>Automação de Leads e Respostas em Redes</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-zinc-500 uppercase">
                    <span className={`w-2.5 h-2.5 rounded-full ${automationActive ? "bg-indigo-500 animate-pulse" : "bg-zinc-300"}`}></span>
                    <span className="text-[10px] font-bold">
                      {automationActive ? `Ativo: ${fixedGenerationTime}` : "Scheduler Inativo"}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {savingConfig ? (
                      <RefreshCw className="w-3 animate-spin text-white" />
                    ) : configSaved ? (
                      <Check className="w-3 text-emerald-400 font-bold" />
                    ) : (
                      <Save className="w-3 text-white" />
                    )}
                    <span>{configSaved ? "Salvo!" : "Salvar Horário"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Visual Customization & Dark Mode / Sound Options */}
            <div id="visual-config" className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs flex flex-col justify-between text-left">
              <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {state.darkMode ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <h2 className="text-sm font-bold text-zinc-800 tracking-wide uppercase font-mono">
                    Visual & Escrita de Foco
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleTheme(!state.darkMode)}
                  className="focus:outline-hidden cursor-pointer"
                >
                  {state.darkMode ? (
                    <ToggleRight className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-zinc-300" />
                  )}
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Estilo Visual do Canvas (UI Themes ERP)</span>
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono max-h-56 overflow-y-auto pr-1">
                      {[
                        { id: "classic", name: "Classic Oliveira", color: "bg-[#556b2f]" },
                        { id: "ch3", name: "CH3 Ouro Industrial", color: "bg-[#d4af37]" },
                        { id: "uol", name: "UOL Orquídea", color: "bg-[#db2777]" },
                        { id: "h2", name: "H2 Blue Service", color: "bg-[#0284c7]" },
                        { id: "refined_neon", name: "Sunset Neon Glow", color: "bg-fuchsia-500" },
                        { id: "sales_iq", name: "SalesIQ Gray Satin", color: "bg-blue-500" },
                        { id: "cyber_matrix", name: "Cyber Matrix Radioactive", color: "bg-green-500" },
                        { id: "forest_harmony", name: "Verde Floresta Orgânico", color: "bg-[#059669]" },
                        { id: "royal_velvet", name: "Royal Purple Velvet", color: "bg-violet-600" },
                        { id: "carbon_brutalist", name: "Carbono Brutalista Mono", color: "bg-amber-500" }
                      ].map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => onSelectActiveTheme(th.id as any)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-[10.5px] font-bold select-none transition-all cursor-pointer ${
                            (state.activeTheme || "classic") === th.id
                              ? "border-zinc-900 bg-zinc-900 text-white shadow-xs font-mono"
                              : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-mono"
                          }`}
                        >
                          <span className="truncate max-w-[120px]">{th.name}</span>
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${th.color}`}></span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <span className="text-[10.5px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Visualização de UI de Escrita</span>
                    <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 mt-1 font-mono">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-805 font-mono">Modo Zen no Editor</span>
                        <p className="text-[10px] text-zinc-500 font-medium font-sans">Auto-esconde painéis e trilhos laterais.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFullscreenMode(!fullscreenMode)}
                        className="bg-zinc-905 text-white hover:bg-zinc-855 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide font-mono uppercase transition cursor-pointer"
                      >
                        {fullscreenMode ? "Desativar" : "Ativar Modo Zen"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>INTERFACE_FOCUS_RENDER</span>
                  <span className="text-zinc-600 font-bold uppercase">{state.activeTheme || "slate"} theme active</span>
                </div>
              </div>
            </div>

            {/* Card 2: Configurações de Notificação por E-mail */}
            <div id="notifications-config" className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs flex flex-col justify-between lg:col-span-2 text-left">
              <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-sm font-bold text-zinc-805 tracking-wide uppercase font-mono">
                    Notificações por E-mail
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                  className="focus:outline-hidden cursor-pointer"
                >
                  {emailNotificationsEnabled ? (
                    <ToggleRight className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-zinc-300" />
                  )}
                </button>
              </div>

              <form onSubmit={handleConfigSubmit} className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3 font-sans">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wide block text-left">Endereço de Notificação</label>
                    <input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      disabled={!emailNotificationsEnabled}
                      className="w-full text-xs text-zinc-750 bg-white border border-zinc-200 rounded-lg p-2.5 disabled:bg-zinc-50 disabled:text-zinc-450 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-mono"
                    />
                  </div>

                  <div className="space-y-2 pt-1 text-xs text-left">
                    {/* Checkbox 1: Campanha completa */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-zinc-750 font-medium select-none">
                      <input
                        type="checkbox"
                        checked={notifyOnCampaignComplete}
                        onChange={(e) => setNotifyOnCampaignComplete(e.target.checked)}
                        disabled={!emailNotificationsEnabled}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-zinc-900"
                      />
                      <span>Avisar de campanhas automáticas completadas</span>
                    </label>

                    {/* Checkbox 2: Erros críticos */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-zinc-750 font-medium select-none text-left">
                      <input
                        type="checkbox"
                        checked={notifyOnErrorCritical}
                        onChange={(e) => setNotifyOnErrorCritical(e.target.checked)}
                        disabled={!emailNotificationsEnabled}
                        className="rounded border-zinc-300 text-indigo-650 focus:ring-zinc-900"
                      />
                      <span className="text-red-650 font-semibold">Avisar em caso de erro crítico no daemon</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between font-mono">
                  <span className="text-[10px] text-zinc-400 uppercase">
                    {emailNotificationsEnabled ? "ALERTAS ATIVOS" : "DESABILITADO"}
                  </span>
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="bg-zinc-905 hover:bg-zinc-855 disabled:bg-zinc-655 text-white font-bold text-[10.5px] px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    {savingConfig ? "Salvando..." : "Salvar Alertas"}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Advanced Data Cleanup and Failsafe Reset Control */}
          <div className="bg-white border border-red-150 rounded-xl overflow-hidden shadow-3xs text-left mt-6">
            <div className="p-5 border-b border-red-100 bg-red-50/10 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600 animate-pulse" />
              <h2 className="text-sm font-bold text-red-800 tracking-wide uppercase font-mono">
                Centro Administrativo de Limpeza de Dados (Failsafe Control)
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Opções para limpar os históricos, rascunhos de posts, campanhas e redefinir o ERP aos padrões originais. Cada operação exige sua devida confirmação de segurança.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 font-mono">
                {/* Limpeza 1: Campanhas */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("ATENÇÃO: Deseja expurgar TODAS as campanhas de automação de IA ativas e arquivadas? Essa ação é definitiva.")) {
                      onModuleCleanup("campaigns");
                      alert("Histórico de Campanhas limpo com sucesso!");
                    }
                  }}
                  className="p-3 border border-zinc-200 hover:border-red-200 hover:bg-red-50/10 rounded-xl flex flex-col justify-between text-left transition duration-205 group cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-black text-zinc-400 group-hover:text-red-550 uppercase tracking-widest">Procedimento I</span>
                  <div className="mt-2 text-[10.5px] font-bold text-zinc-800">Expurgar Campanhas</div>
                </button>

                {/* Limpeza 2: Leads */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("ATENÇÃO: Deseja excluir permanentemente todos os leads coletados pelo robô ERP? Essa ação é irreversível.")) {
                      onModuleCleanup("leads");
                      alert("Banco de Leads capturados limpo com sucesso!");
                    }
                  }}
                  className="p-3 border border-zinc-200 hover:border-red-200 hover:bg-red-50/10 rounded-xl flex flex-col justify-between text-left transition duration-205 group cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-black text-zinc-400 group-hover:text-red-550 uppercase tracking-widest">Procedimento II</span>
                  <div className="mt-2 text-[10.5px] font-bold text-zinc-800 font-sans">Excluir Leads Coletados</div>
                </button>

                {/* Limpeza 3: Posts */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("ATENÇÃO: Deseja deletar todas as postagens e cópias de rascunhos criadas por IA?")) {
                      onModuleCleanup("posts");
                      alert("Lista de Posts apagada com sucesso!");
                    }
                  }}
                  className="p-3 border border-zinc-200 hover:border-red-200 hover:bg-red-50/10 rounded-xl flex flex-col justify-between text-left transition duration-205 group cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-black text-zinc-400 group-hover:text-red-550 uppercase tracking-widest">Procedimento III</span>
                  <div className="mt-2 text-[10.5px] font-bold text-zinc-800 font-sans">Excluir Posts de IA</div>
                </button>

                {/* Limpeza 4: Logs */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("ATENÇÃO: Deseja esvaziar todos os registros de auditoria e console de logs?")) {
                      onModuleCleanup("logs");
                      alert("Console de logs de auditoria limpo!");
                    }
                  }}
                  className="p-3 border border-zinc-200 hover:border-red-200 hover:bg-red-50/10 rounded-xl flex flex-col justify-between text-left transition duration-205 group cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-black text-zinc-400 group-hover:text-red-550 uppercase tracking-widest">Procedimento IV</span>
                  <div className="mt-2 text-[10.5px] font-bold text-zinc-805">Esvaziar Logs Histórico</div>
                </button>
              </div>

              {/* Reset Total do Sistema */}
              <div className="p-4 border border-red-200 bg-red-50/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                  <h4 className="text-xs font-bold text-red-900 flex items-center gap-1.5 font-mono">
                    <span>RESTAURAR SISTEMA PARA O PADRÃO ORIGINAL</span>
                  </h4>
                  <p className="text-[10px] text-red-750 font-medium mt-1 leading-relaxed max-w-xl font-sans">
                    Apaga todas as entidades (campanhas, posts, leads, logs) e redefine o perfil e as configurações do sistema de volta às variáveis iniciais do layout. Exige confirmação final.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("PERIGO: Esta ação irá redefinir o SISTEMA INTEIRO para o estado original (Configurações, Campanhas, Filtros, Temas). Deseja prosseguir de forma definitiva?")) {
                      onModuleCleanup("factory_reset");
                      alert("Redefinição concluída! O sistema foi restaurado.");
                    }
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 hover:scale-102 active:scale-98 text-white text-[10.5px] font-bold uppercase tracking-wider font-mono rounded-lg transition duration-200 cursor-pointer self-start sm:self-center inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-white" />
                  Reset Fábrica ERP
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Supabase Synchronized Audit Trails */}
          <LogAuditoria />

          {/* Embedded Terminal Log Console Section */}
          <div className="bg-slate-900 border border-slate-950 rounded-xl overflow-hidden shadow-lg mt-4 text-left font-mono">
            <div className="bg-slate-950 px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between select-none">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold tracking-widest uppercase">
                  Consola de Execução de Logs da Automação (Audit Trails)
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearLogs}
                className="text-[10px] border border-slate-750 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded transition font-mono cursor-pointer"
              >
                Clear logs
              </button>
            </div>

            <div className="p-5 text-xs text-slate-300 space-y-2 max-h-56 overflow-y-auto text-left whitespace-pre-wrap select-text font-mono">
              {activeLogs.length > 0 ? (
                activeLogs.map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <span className="text-slate-500 font-medium min-w-[140px] flex-shrink-0">
                      [{new Date(log.timestamp).toLocaleString("pt-BR")}]
                    </span>
                    <span className="text-emerald-400 font-bold">
                      [SUCCESS]
                    </span>
                    <span className="text-slate-300 font-sans">
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic font-mono">Nenhum evento registrado no console do container.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Integrações Externas */}
      {activeSubTab === "integracoes" && (
        <div className="space-y-6 pt-2">
          {/* Authenticate and Manage Social channels via Zustand */}
          <ManageChannelsView state={state} onRefreshState={onRefreshState} />

          <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs text-left">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between col-span-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-650" />
                <h2 className="text-sm font-bold text-zinc-800 tracking-wide uppercase font-mono">
                  Integrações de Webhook Personalizadas (CRMs)
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded uppercase font-mono">
                Hubspot & Pipedrive Preset
              </span>
            </div>

            <div className="p-5 space-y-6 text-left">
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                Dispare dados transacionais em tempo real para o seu CRM favorito toda vez que um ciclo de automação criar um lead qualificado ou acusar um erro de execução crítica.
              </p>

              {/* Quick Preset Buttons */}
              <div className="bg-zinc-50/80 p-4 border border-zinc-150 rounded-xl space-y-3 font-sans">
                <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest font-mono">Predefinições de CRM Populares</h3>
                <div className="flex flex-wrap gap-2 animate-fade-in font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setLeadWebhook({
                        ...leadWebhook,
                        url: "https://api.hubapi.com/webhooks/v1/leads-captured",
                        payloadFormat: "JSON",
                        enabled: true
                      });
                      alert("Predefinição HubSpot carregada! Clique em 'Salvar Configurações de Webhook' no rodapé para persistir.");
                    }}
                    className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Integrar com HubSpot CRM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadWebhook({
                        ...leadWebhook,
                        url: "https://pipedrive.api.delivery/v2/webhooks/lead_captures",
                        payloadFormat: "JSON",
                        enabled: true
                      });
                      alert("Predefinição Pipedrive carregada! Clique em 'Salvar Configurações de Webhook' no rodapé para persistir.");
                    }}
                    className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Integrar com Pipedrive CRM
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event 1: Novo Lead Capturado */}
                <div className="border border-zinc-200 rounded-xl p-4 space-y-4 bg-white hover:border-zinc-300 transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded uppercase font-mono">
                        EVENT_LEAD_CAPTURED
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 pt-0.5">Novo Lead Capturado</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLeadWebhook({ ...leadWebhook, enabled: !leadWebhook.enabled })}
                      className="focus:outline-hidden cursor-pointer"
                    >
                      {leadWebhook.enabled ? (
                        <ToggleRight className="w-7 h-7 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-zinc-300" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block font-mono">URL do End-Point</label>
                      <input
                        type="url"
                        placeholder="https://sua-api.com/lead-webhook"
                        value={leadWebhook.url}
                        onChange={(e) => setLeadWebhook({ ...leadWebhook, url: e.target.value })}
                        disabled={!leadWebhook.enabled}
                        className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-zinc-90 w-full disabled:bg-zinc-50 disabled:text-zinc-400 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1 font-mono">Formato do Payload</label>
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <button
                          type="button"
                          disabled={!leadWebhook.enabled}
                          onClick={() => setLeadWebhook({ ...leadWebhook, payloadFormat: "JSON" })}
                          className={`text-xs font-bold py-1.5 rounded-lg border text-center transition cursor-pointer ${
                            leadWebhook.payloadFormat === "JSON"
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                              : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 disabled:bg-zinc-50"
                          }`}
                        >
                          JSON (Recomendado)
                        </button>
                        <button
                          type="button"
                          disabled={!leadWebhook.enabled}
                          onClick={() => setLeadWebhook({ ...leadWebhook, payloadFormat: "Form-Data" })}
                          className={`text-xs font-bold py-1.5 rounded-lg border text-center transition cursor-pointer ${
                            leadWebhook.payloadFormat === "Form-Data"
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                              : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 disabled:bg-zinc-50"
                          }`}
                        >
                          Form-Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event 2: Erro de Automação */}
                <div className="border border-zinc-200 rounded-xl p-4 space-y-4 bg-white hover:border-zinc-300 transition-all text-left">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded uppercase font-mono">
                        EVENT_AUTOMATION_ERROR
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 pt-0.5">Erro de Automação</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorWebhook({ ...errorWebhook, enabled: !errorWebhook.enabled })}
                      className="focus:outline-hidden cursor-pointer"
                    >
                      {errorWebhook.enabled ? (
                        <ToggleRight className="w-7 h-7 text-rose-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-zinc-300" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-3 font-sans font-mono">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block font-mono">URL do End-Point</label>
                      <input
                        type="url"
                        placeholder="https://sua-api.com/error-webhook"
                        value={errorWebhook.url}
                        onChange={(e) => setErrorWebhook({ ...errorWebhook, url: e.target.value })}
                        disabled={!errorWebhook.enabled}
                        className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-zinc-90 w-full disabled:bg-zinc-50 disabled:text-zinc-400 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1 text-left font-mono">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1 font-mono">Formato do Payload</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!errorWebhook.enabled}
                          onClick={() => setErrorWebhook({ ...errorWebhook, payloadFormat: "JSON" })}
                          className={`text-xs font-bold py-1.5 rounded-lg border text-center transition cursor-pointer ${
                            errorWebhook.payloadFormat === "JSON"
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                              : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 disabled:bg-zinc-50"
                          }`}
                        >
                          JSON (Recomendado)
                        </button>
                        <button
                          type="button"
                          disabled={!errorWebhook.enabled}
                          onClick={() => setErrorWebhook({ ...errorWebhook, payloadFormat: "Form-Data" })}
                          className={`text-xs font-bold py-1.5 rounded-lg border text-center transition cursor-pointer ${
                            errorWebhook.payloadFormat === "Form-Data"
                              ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                              : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 disabled:bg-zinc-50"
                          }`}
                        >
                          Form-Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-zinc-50 border-t border-zinc-150 flex items-center justify-between text-left">
              <span className="text-[10px] text-zinc-400 font-mono">Integrador de webhook automatizado com verificação de payload ativa.</span>
              <button
                type="button"
                onClick={handleConfigSubmit}
                disabled={savingConfig}
                className="bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-650 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                {savingConfig ? <RefreshCw className="w-3 animate-spin text-white" /> : <Save className="w-3 text-white" />}
                <span>Salvar Configurações de Webhook</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Gestão de Hashtags */}
      {activeSubTab === "hashtags" && (
        <div className="space-y-6 pt-2 text-left">
          <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between col-span-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-zinc-800 tracking-wide uppercase font-mono">
                  Grupos Temáticos de Hashtags
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded uppercase font-mono">
                {hashtagGroups.length} Grupos Disponíveis
              </span>
            </div>

            <div className="p-5 space-y-6 text-left">
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                Crie grupos personalizados organizados por temas estratégicos. Eles estarão disponíveis com um único clique via o botão <strong>"Auto-Hashtag"</strong> diretamente no editor de escrita inteligente para impulsionar instantaneamente o seu alcance e indexação algorítmica.
              </p>

              {/* Add New Group Dialog form */}
              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-4">
                <h3 className="text-xs font-bold text-zinc-800 font-mono uppercase tracking-wide font-mono">Adicionar Novo Grupo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left font-mono">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Identificador Temático (Ex: #ia)</label>
                    <input
                      type="text"
                      placeholder="Ex: #marketing, #design, #startup"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full text-xs text-zinc-750 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5 text-left font-mono">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Hashtags Separadas por Espaço</label>
                    <input
                      type="text"
                      placeholder="#sucesso #tecnologia #saas #ia"
                      value={newGroupHashtags}
                      onChange={(e) => setNewGroupHashtags(e.target.value)}
                      className="w-full text-xs text-zinc-755 bg-white border border-zinc-200 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-zinc-900 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newGroupName.trim() || !newGroupHashtags.trim()) {
                        alert("Por favor preencha todos os campos do grupo de hashtags!");
                        return;
                      }
                      const id = String(Date.now());
                      const updated = [...hashtagGroups, { id, name: newGroupName.trim(), hashtags: newGroupHashtags.trim() }];
                      setHashtagGroups(updated);
                      setNewGroupName("");
                      setNewGroupHashtags("");
                      onUpdateConfig({ ...state.config, hashtagGroups: updated });
                    }}
                    className="bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
                  >
                    + Criar Grupo Temático
                  </button>
                </div>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-left">
                {hashtagGroups.map((group) => (
                  <div key={group.id} className="border border-zinc-150 hover:border-zinc-350 p-4 rounded-xl flex flex-col justify-between space-y-3 bg-white transition hover:shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded tracking-wide font-mono uppercase">
                          GP_THEME
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 pt-1 font-mono">{group.name}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = hashtagGroups.filter(g => g.id !== group.id);
                          setHashtagGroups(updated);
                          onUpdateConfig({ ...state.config, hashtagGroups: updated });
                        }}
                        className="p-1 hover:bg-rose-50 text-zinc-350 hover:text-rose-600 rounded transition cursor-pointer"
                        title="Deletar grupo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-150 p-2.5 rounded-lg text-left font-mono">
                      <p className="text-[10px] text-zinc-500 font-bold overflow-y-auto max-h-16 break-all">
                        {group.hashtags}
                      </p>
                    </div>

                    <div className="text-[9.5px] font-medium text-zinc-400 font-mono text-left">
                      Contém {group.hashtags.split(" ").filter(Boolean).length} hashtags indexadas
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-zinc-50 border-t border-zinc-150 flex items-center justify-between text-left">
              <span className="text-[10px] text-zinc-400 font-mono">Estes grupos se conectarão recursivamente ao posts manager editor.</span>
              <button
                type="button"
                onClick={handleConfigSubmit}
                disabled={savingConfig}
                className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-650 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                {savingConfig ? <RefreshCw className="w-3 animate-spin text-white" /> : <Save className="w-3 text-white" />}
                <span>Salvar Grupos de Hashtags</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Agendamento Inteligente */}
      {activeSubTab === "agendamento" && (
        <div className="space-y-6 pt-2 text-left animate-fade-in">
          <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-3xs">
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between col-span-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-zinc-800 tracking-wide uppercase font-mono">
                  Mecanismo de Agendamento Inteligente e Autopublicação
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded uppercase font-mono">
                Análise Preditiva IA Ativa
              </span>
            </div>

            <div className="p-5 space-y-6 text-left">
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                Com base na análise preditiva dos algoritmos da Open Studio, detectamos os horários que reúnem picos de atenção integrada do público para obter o mais alto volume de cliques e compartilhamentos síncronos.
              </p>

              {/* Form Rule for Auto Publishing */}
              <div className="bg-zinc-50/80 hover:bg-zinc-100/50 border border-zinc-150 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                <div className="space-y-0.5 text-left">
                  <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-wide">
                    REGRA_AUTO_PUBLISH
                  </span>
                  <h3 className="text-xs font-bold text-zinc-900 pt-1 font-mono">Autopublicação Ativa</h3>
                  <p className="text-[11px] text-zinc-500 max-w-xl">
                    Quando esta opção está selecionada, posts com o status "Agendado" que atingirem o horário configurado de expiração sofrerão transição automatizada pelo background executor para o status "Publicado", emulando publicação real instantaneamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoPublishScheduledEnabled(!autoPublishScheduledEnabled)}
                  className="focus:outline-hidden cursor-pointer"
                >
                  {autoPublishScheduledEnabled ? (
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-zinc-300" />
                  )}
                </button>
              </div>

              {/* Optimal Times Per Channel */}
              <div className="space-y-3 font-sans text-left">
                <h3 className="text-xs font-bold text-zinc-800 font-mono uppercase tracking-wide font-mono">Melhores Horários Sugeridos por Canal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { channel: "LinkedIn", time: "Terça e Quinta, 10h", engagement: "Muito Alto (9.2%)", style: "text-emerald-700 font-bold font-mono", bg: "bg-blue-50/50 border-blue-150" },
                    { channel: "Instagram", time: "Segunda, Quarta e Sex, 18h", engagement: "Alto (7.8%)", style: "text-emerald-600 font-bold font-mono", bg: "bg-pink-50/50 border-pink-150" },
                    { channel: "YouTube", time: "Quarta e Sexta, 14h", engagement: "Alto (8.1%)", style: "text-emerald-600 font-bold font-mono", bg: "bg-red-50/50 border-red-150" },
                    { channel: "TikTok", time: "Diariamente, 20h às 22h", engagement: "Crítico (11.4%)", style: "text-purple-700 font-bold font-mono", bg: "bg-purple-50/50 border-purple-150" },
                    { channel: "Twitter 𝕏", time: "Segunda a Sexta, 12h", engagement: "Médio (5.4%)", style: "text-indigo-600 font-bold font-mono", bg: "bg-zinc-50/50 border-zinc-200" }
                  ].map((rec, idx) => (
                    <div key={idx} className={`border p-3.5 rounded-xl text-left space-y-2 ${rec.bg}`}>
                      <span className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-widest block font-mono">
                        RECOMENDAÇÃO {idx+1}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900">{rec.channel}</h4>
                      <p className="text-[11px] text-zinc-700 font-semibold">{rec.time}</p>
                      <div className="text-[10px] font-mono pt-1 text-zinc-500">
                        Alcance previsto: <span className={rec.style}>{rec.engagement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Section */}
            <div className="p-5 bg-zinc-50 border-t border-zinc-150 flex items-center justify-between text-left">
              <span className="text-[10px] text-zinc-400 font-mono">Regras de agendamento inteligentes são executadas recursivamente via cron.</span>
              <button
                type="button"
                onClick={handleConfigSubmit}
                disabled={savingConfig}
                className="bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-650 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                {savingConfig ? <RefreshCw className="w-3 animate-spin text-white" /> : <Save className="w-3 text-white" />}
                <span>Salvar Inteligência de Agendamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
