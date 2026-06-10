import React, { useState, FormEvent } from "react";
import { 
  User, 
  Search, 
  UserPlus, 
  Filter, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Sparkles, 
  CheckCircle, 
  X, 
  Copy,
  AlertCircle,
  TrendingDown,
  RefreshCw,
  Send,
  Plus
} from "lucide-react";
import { AppState, Lead } from "../types";

interface LeadsViewProps {
  state: AppState;
  activeChannel: string;
  onAddLead: (lead: any) => Promise<void>;
  onUpdateLeadStatus: (id: string, status: "Novo" | "Contactado" | "Convertido") => Promise<void>;
}

export default function LeadsView({ state, activeChannel, onAddLead, onUpdateLeadStatus }: LeadsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [sourceFilter, setSourceFilter] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Manual Lead Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // AI Hook Modal
  const [selectedLeadForHook, setSelectedLeadForHook] = useState<Lead | null>(null);
  const [generatingHook, setGeneratingHook] = useState(false);
  const [aiHookOutput, setAiHookOutput] = useState("");
  const [copiedHook, setCopiedHook] = useState(false);

  // Dynamic filter lists
  const uniqueSources = Array.from(new Set(state.leads.map(l => l.source)));

  const filteredLeads = state.leads.filter((lead) => {
    // Search query constraint
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(query) ||
      lead.company.toLowerCase().includes(query) ||
      lead.role.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query);

    // Status filter
    const matchesStatus = statusFilter === "Todos" || lead.status === statusFilter;

    // Source filter
    const matchesSource = sourceFilter === "Todos" || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusStyle = (status: "Novo" | "Contactado" | "Convertido") => {
    switch (status) {
      case "Novo":
        return "bg-blue-50 text-blue-700 border border-blue-100";
      case "Contactado":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Convertido":
        return "bg-green-50 text-green-700 border border-green-100";
      default:
        return "bg-zinc-100 text-zinc-650";
    }
  };

  const handleCycleStatus = async (lead: Lead) => {
    let nextStatus: "Novo" | "Contactado" | "Convertido" = "Novo";
    if (lead.status === "Novo") nextStatus = "Contactado";
    else if (lead.status === "Contactado") nextStatus = "Convertido";
    else nextStatus = "Novo";

    await onUpdateLeadStatus(lead.id, nextStatus);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMsg("Nome e Email são campos obrigatórios.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      await onAddLead({
        name,
        email,
        phone,
        role: role || "Profissional",
        company: company || "Autônomo",
        source: source || "Inscrição Direta",
      });
      // Reset
      setName("");
      setEmail("");
      setPhone("");
      setRole("");
      setCompany("");
      setSource("");
      setShowAddModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao cadastrar lead.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateHook = async (lead: Lead) => {
    setSelectedLeadForHook(lead);
    setGeneratingHook(true);
    setAiHookOutput("");
    try {
      // Use Gemini to generate a personalized outreach hook based on his background!
      const geminiPrompt = `Gere uma abordagem comercial super personalizada de conversão de leads para o LinkedIn.
Dado do profissional capturado:
Nome: ${lead.name}
Cargo: ${lead.role}
Empresa: ${lead.company}
Isca comentada original: "${lead.source}"

Directives for output:
1. Comece de forma amigável referenciando o interesse dele no conteúdo do post.
2. Formule uma provocação cirúrgica e sutil que conecta o cargo dele ("${lead.role}") aos desafios práticos em automação ou IA com NoCode Startup.
3. Crie uma pergunta final instigadora de Call-to-action para agendar uma conversa curta.
4. Escreva em português brasileiro fluido, tom elegante, sem bajulações ou jargões corporativos saturados.`;

      const response = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: geminiPrompt,
          tone: "Editorial / Profissional",
          keyword: "consultoria",
          referencePrompt: "Foque em criar abordagens em texto direto sem títulos, direto para mensagem privada do LinkedIn."
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Clean metadata response format if any
      setAiHookOutput(data.content || "Olá!");
    } catch (err: any) {
      console.error(err);
      setAiHookOutput(`Olá ${lead.name}! Vi seu interesse em "${lead.source}". Como ${lead.role} na ${lead.company}, as rotinas do Claude Code e inteligência com IA podem redefinir a agilidade de entrega do time. Vamos trocar uma ideia curta de 10 minutos esta semana? Abs!`);
    } finally {
      setGeneratingHook(false);
    }
  };

  const copyHookToClipboard = () => {
    navigator.clipboard.writeText(aiHookOutput);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <span className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">
            {activeChannel} · CRM LEADS
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Leads Capturados
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Acompanhe os dados de contato capturados pelas suas automações de comentários. Clique em qualquer status para atualizá-lo.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white hover:bg-zinc-800 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Lead</span>
          </button>
        </div>
      </div>

      {/* Control filters bar */}
      <div className="bg-white p-4 border border-zinc-150 rounded-xl shadow-3xs grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, cargo, empresa ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs placeholder:text-zinc-400 text-zinc-800 bg-zinc-50/50 border border-zinc-200 rounded-lg pl-9 pr-4 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
          />
        </div>

        {/* Source filtering */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 font-mono">Post:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="flex-1 text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
          >
            <option value="Todos">Todos os posts</option>
            {uniqueSources.map((source, i) => (
              <option key={i} value={source}>{source.substring(0, 30)}...</option>
            ))}
          </select>
        </div>

        {/* Status filtering */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
          >
            <option value="Todos">Todos os status</option>
            <option value="Novo">Novo</option>
            <option value="Contactado">Contactado</option>
            <option value="Convertido">Convertido</option>
          </select>
        </div>
      </div>

      {/* CRM List grid */}
      <div className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider">
                <th className="px-6 py-4">Profissional</th>
                <th className="px-6 py-4">Empresa / Cargo</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Origem / Campanha</th>
                <th className="px-6 py-4 text-center">Data</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">IA Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50/30 transition-all">
                    {/* Professional name and avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-650 font-mono">
                          {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-800 leading-none">{lead.name}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">ID: {lead.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role and Corporate info */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 select-all">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-700 font-medium font-sans">
                          <Briefcase className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          <span>{lead.role}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                          <Building className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          <span>{lead.company}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email / Phone parameters */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer select-all" title="Copiar e-mail">
                          <Mail className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          <span>{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500 font-mono">
                            <Phone className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Marketing Source thread link */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-semibold text-zinc-700 truncate text-[11px]" title={lead.source}>
                        {lead.source}
                      </p>
                    </td>

                    {/* Captured date */}
                    <td className="px-6 py-4 text-center text-xs text-zinc-400 font-mono whitespace-nowrap">
                      {lead.date}
                    </td>

                    {/* Interactive clickable Status Badging */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleCycleStatus(lead)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide ${getStatusStyle(lead.status)}`}
                        title="Clique para alternar o status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          lead.status === "Novo" ? "bg-blue-500" :
                          lead.status === "Contactado" ? "bg-amber-500" : "bg-green-500"
                        }`}></span>
                        <span>{lead.status.toUpperCase()}</span>
                      </button>
                    </td>

                    {/* Copywriting Outreach Trigger */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleGenerateHook(lead)}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all shadow-3xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-red-500" />
                        <span>Resumo IA</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-zinc-400 font-medium">
                    Nenhum profissional capturado de acordo com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Outreach Pitch Hook Modal */}
      {selectedLeadForHook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            
            {/* Header Title */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-red-600 fill-red-100" />
                <span className="text-sm font-bold text-zinc-900">Abordagem de Conversão LinkedIn</span>
              </div>
              <button 
                onClick={() => setSelectedLeadForHook(null)}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Detail recap */}
            <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-150 text-xs">
              <div className="font-bold text-zinc-750 font-mono bg-zinc-200 w-8 h-8 rounded-full flex items-center justify-center">
                {selectedLeadForHook.name[0]}
              </div>
              <div>
                <p className="font-bold text-zinc-800">{selectedLeadForHook.name}</p>
                <p className="text-zinc-500">{selectedLeadForHook.role} na {selectedLeadForHook.company}</p>
              </div>
            </div>

            {/* Message generated display */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider uppercase block">
                Mensagem Sugerida por Gemini
              </span>
              
              {generatingHook ? (
                <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-zinc-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-zinc-650" />
                  <p className="text-xs font-semibold">Traçando perfil profissional e gerando pitch sutil...</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="bg-zinc-900 text-zinc-100 border border-zinc-800 p-4 rounded-xl text-xs overflow-y-auto max-h-72 leading-relaxed whitespace-pre-line font-medium select-all">
                    {aiHookOutput}
                  </div>
                  
                  <button
                    onClick={copyHookToClipboard}
                    className="absolute right-3.5 bottom-3.5 bg-zinc-805 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg p-2 transition flex items-center gap-1.5 text-[9px] font-semibold"
                  >
                    {copiedHook ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* CTA action buttons */}
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedLeadForHook(null)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs px-4 py-2 rounded-lg transition"
              >
                Voltar
              </button>
              <a
                href={`mailto:${selectedLeadForHook.email}?subject=NoCode Startup Contato`}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar E-mail</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Manual Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden p-6 shadow-2xl space-y-4">
            
            {/* Header Title */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-zinc-750" />
                <h3 className="text-md font-bold text-zinc-900">Cadastrar Lead Manualmente</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-zinc-100 rounded text-zinc-405 hover:text-zinc-705 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Inputs Form */}
            <form onSubmit={handleSubmitLead} className="grid grid-cols-1 gap-3 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pedro Henrique"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide">Email corporativo</label>
                  <input
                    type="email"
                    required
                    placeholder="pj@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+55 11 99999-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide">Cargo / Ocupação</label>
                  <input
                    type="text"
                    placeholder="Ex: Tech Lead"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide">Empresa</label>
                  <input
                    type="text"
                    placeholder="Ex: NoCode Startup"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide">Origem do Cadastro</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg p-2.5 focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="">Selecione o post de origem</option>
                  <option value="Inscrição Direta">Inscrição Direta / Landing page</option>
                  {state.campaigns.map((c, i) => (
                    <option key={i} value={c.postTitle}>{c.postTitle.slice(0, 45)}...</option>
                  ))}
                </select>
              </div>
            </form>

            {/* Actions */}
            <div className="pt-3 border-t border-zinc-100 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-zinc-100 text-zinc-650 hover:bg-zinc-200 font-semibold text-xs py-2.5 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmitLead}
                disabled={submitting}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-600 text-white font-semibold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                <span>Salvar Informações</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
