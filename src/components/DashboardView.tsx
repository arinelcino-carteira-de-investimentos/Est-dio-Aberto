import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Send, 
  Youtube, 
  Github, 
  AlertTriangle,
  ArrowRight,
  Download,
  CheckCircle2,
  XCircle,
  Info,
  Flame,
  BarChart2,
  LineChart as LineIcon,
  Eye,
  Plus,
  Trash2,
  ClipboardCopy,
  StickyNote,
  Maximize2,
  Minimize2,
  Calculator,
  ShoppingCart,
  PlusSquare,
  BarChart3
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AppState } from "../types";
import { PersonalCallNotification } from "./PersonalCallNotification";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  Cell,
  PieChart,
  Pie,
  Line
} from "recharts";

interface DashboardViewProps {
  state: AppState;
  onSync: () => Promise<void>;
  fullscreenMode?: boolean;
  setFullscreenMode?: (val: boolean) => void;
}

export default function DashboardView({ state, onSync, fullscreenMode = false, setFullscreenMode }: DashboardViewProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState("08:40");
  const [showExportModal, setShowExportModal] = useState(false);
  const [timeframe, setTimeframe] = useState<"7d" | "15d" | "30d">("30d");

  const handleSyncClick = async () => {
    setSyncing(true);
    try {
      await onSync();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const leadsTotalCurrent = state.profile.leadsCapturedCount || 450;
  
  const getLeadGrowthData = () => {
    switch (timeframe) {
      case "7d":
        return [
          { name: "03/Jun", leads: Math.round(leadsTotalCurrent * 0.88), conversao: 90, engajamento: 8.4 },
          { name: "05/Jun", leads: Math.round(leadsTotalCurrent * 0.93), conversao: 92, engajamento: 8.6 },
          { name: "07/Jun", leads: Math.round(leadsTotalCurrent * 0.97), conversao: 94, engajamento: 8.5 },
          { name: "10/Jun", leads: leadsTotalCurrent, conversao: 96, engajamento: 8.9 },
        ];
      case "15d":
        return [
          { name: "26/Mai", leads: Math.round(leadsTotalCurrent * 0.72), conversao: 82, engajamento: 7.8 },
          { name: "29/Mai", leads: Math.round(leadsTotalCurrent * 0.80), conversao: 86, engajamento: 8.0 },
          { name: "01/Jun", leads: Math.round(leadsTotalCurrent * 0.85), conversao: 89, engajamento: 8.2 },
          { name: "04/Jun", leads: Math.round(leadsTotalCurrent * 0.91), conversao: 91, engajamento: 8.4 },
          { name: "07/Jun", leads: Math.round(leadsTotalCurrent * 0.96), conversao: 94, engajamento: 8.5 },
          { name: "10/Jun", leads: leadsTotalCurrent, conversao: 96, engajamento: 8.9 },
        ];
      case "30d":
      default:
        return [
          { name: "11/Mai", leads: Math.round(leadsTotalCurrent * 0.35), conversao: 74, engajamento: 6.8 },
          { name: "16/Mai", leads: Math.round(leadsTotalCurrent * 0.48), conversao: 78, engajamento: 7.2 },
          { name: "21/Mai", leads: Math.round(leadsTotalCurrent * 0.62), conversao: 81, engajamento: 7.5 },
          { name: "26/Mai", leads: Math.round(leadsTotalCurrent * 0.74), conversao: 85, engajamento: 7.9 },
          { name: "01/Jun", leads: Math.round(leadsTotalCurrent * 0.85), conversao: 89, engajamento: 8.1 },
          { name: "06/Jun", leads: Math.round(leadsTotalCurrent * 0.94), conversao: 92, engajamento: 8.6 },
          { name: "10/Jun", leads: leadsTotalCurrent, conversao: 96, engajamento: 8.9 },
        ];
    }
  };

  const leadGrowthData = getLeadGrowthData();

  const leadDistributionData = [
    { name: "LinkedIn", value: Math.round(leadsTotalCurrent * 0.40), color: "#0A66C2" },
    { name: "Instagram", value: Math.round(leadsTotalCurrent * 0.25), color: "#E1306C" },
    { name: "TikTok", value: Math.round(leadsTotalCurrent * 0.15), color: "#FE2C55" },
    { name: "Facebook", value: Math.round(leadsTotalCurrent * 0.08), color: "#1877F2" },
    { name: "YouTube", value: Math.round(leadsTotalCurrent * 0.07), color: "#FF0000" },
    { name: "Twitter", value: Math.round(leadsTotalCurrent * 0.05), color: "#1DA1F2" },
  ];

  const lowPerformanceCampaigns = state.campaigns ? state.campaigns.filter(c => {
    if (c.status !== "Ativa" || c.respondidos < 10) return false;
    const rate = (c.leads / c.respondidos) * 100;
    if (rate >= 5) return false;
    const createdDate = new Date(c.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours >= 48;
  }) : [];

  const averageEngagementData = [
    { channel: "LinkedIn", taxa: 4.8 },
    { channel: "Instagram", taxa: 6.2 },
    { channel: "TikTok", taxa: 7.5 },
    { channel: "Facebook", taxa: 2.1 },
    { channel: "YouTube", taxa: 5.4 },
    { channel: "Outros", taxa: 3.0 },
  ];

  const [channelA, setChannelA] = useState("LinkedIn");
  const [channelB, setChannelB] = useState("YouTube");

  // Dynamic Date-Time state synchronized in real-time
  const [currentDateFormatted, setCurrentDateFormatted] = useState("");

  const updateDateTime = () => {
    const date = new Date();
    const days = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"];
    const months = [
      "DE JANEIRO", "DE FEVEREIRO", "DE MARÇO", "DE ABRIL", "DE MAIO", "DE JUNHO", 
      "DE JULHO", "DE AGOSTO", "DE SETEMBRO", "DE OUTUBRO", "DE NOVEMBRO", "DE DEZEMBRO"
    ];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setCurrentDateFormatted(`${dayName}, ${dayNum} ${monthName} DE ${year} · ${timeStr}`);
  };

  useEffect(() => {
    updateDateTime();
    const timer = setInterval(updateDateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return "Bom dia";
    if (hr >= 12 && hr < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = state.profile?.name?.split(" ")[0] || state.authSession?.username || "Administrador";

  // Enterprise ERP States
  const [isRegistrarEntradaOpen, setIsRegistrarEntradaOpen] = useState(false);
  const [isRelatorioGeralOpen, setIsRelatorioGeralOpen] = useState(false);
  
  // Floating Calculator States
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("");

  // Skeletons, loadings, and Toast notifications
  const [isEntradaLoading, setIsEntradaLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const triggerToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard listener to toggle floating calculator with 'c' or 'C'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setIsCalcOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFullscreenToggle = () => {
    if (setFullscreenMode) {
      setFullscreenMode(!fullscreenMode);
      // Attempt native document toggle if supported
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } catch (e) {}
    }
  };

  const handleAutoPostTrend = async (title: string, content: string) => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          channel: "LinkedIn",
          status: "Draft",
          keyword: "agentes"
        })
      });
      if (response.ok) {
        await onSync();
      }
    } catch (err) {
      console.error("[AutoPost Trend Error]:", err);
    }
  };

  // Load products list for Sales & Entries Modals
  const getProductsList = (): any[] => {
    try {
      const saved = localStorage.getItem("nocode_inventory_products");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: "PRD-1001", name: "Licença OpenAI API Pro (Anual)", category: "Software", price: 1450.00, stock: 45, ean: "7891001220191", status: "Disponível" },
      { id: "PRD-1002", name: "Robô Extrator de Leads LinkedIn", category: "Automação", price: 850.00, stock: 120, ean: "7891002330197", status: "Disponível" },
      { id: "PRD-1003", name: "Consultoria Setup AI Agent (10h)", category: "Serviço", price: 2900.00, stock: 8, ean: "7891003440193", status: "Abaixo do Mínimo" },
      { id: "PRD-1004", name: "Webcam Full HD Pro Streamer 4K", category: "Hardware", price: 650.00, stock: 0, ean: "7891004550199", status: "Esgotado" },
      { id: "PRD-1005", name: "Servidor VPS Cloud Dedicado (Mensal)", category: "Infraestrutura", price: 180.00, stock: 250, ean: "7891005660195", status: "Disponível" },
    ];
  };

  // State fields for the transaction modals
  const [entryProductId, setEntryProductId] = useState("PRD-1001");
  const [entryQty, setEntryQty] = useState(10);

  const handleExecuteEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryQty <= 0) return;

    setIsEntradaLoading(true);
    setTimeout(() => {
      try {
        const currentProducts = getProductsList();
        const product = currentProducts.find(p => p.id === entryProductId);

        if (!product) {
          triggerToast("Erro: Ativo não localizado no sistema.", "error");
          setIsEntradaLoading(false);
          return;
        }

        // Add to stock
        product.stock += entryQty;
        if (product.stock > 10) product.status = "Disponível";
        else if (product.stock > 0) product.status = "Abaixo do Mínimo";

        localStorage.setItem("nocode_inventory_products", JSON.stringify(currentProducts));

        triggerToast(`Entrada registrada! Adicionadas ${entryQty} unidades ao ativo ${product.name}.`, "success");
        setIsRegistrarEntradaOpen(false);
        setEntryQty(10);
      } catch (err) {
        triggerToast("Falha técnica ao ajustar provisão.", "error");
      } finally {
        setIsEntradaLoading(false);
      }
    }, 1100);
  };


  // Load and state management for Quick Notes (Ideias e Lembretes rápidos)
  const [quickNotes, setQuickNotes] = useState<{ id: string; content: string; createdAt: string }[]>(() => {
    try {
      const saved = localStorage.getItem("nocode_quick_notes");
      return saved ? JSON.parse(saved) : [
        { id: "note_1", content: "Sugerir novo post sobre como usar Claude Code com Docker no final de semana", createdAt: "09/06/2026 às 12:44" },
        { id: "note_2", content: "Lembrete: Ajustar fuso horário do robô de automação das DMs do Instagram", createdAt: "09/06/2026 às 10:15" },
        { id: "note_3", content: "Ideia: Fazer carrossel sobre wrappers de IA vs APIs puras para atrair novos leads de tecnologia", createdAt: "08/06/2026 às 15:30" }
      ];
    } catch (e) {
      return [];
    }
  });
  const [newNoteText, setNewNoteText] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const dateStr = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).replace(",", " às");
    const newNote = {
      id: "note_" + Date.now(),
      content: newNoteText.trim(),
      createdAt: dateStr
    };
    const updated = [newNote, ...quickNotes];
    setQuickNotes(updated);
    localStorage.setItem("nocode_quick_notes", JSON.stringify(updated));
    setNewNoteText("");
  };

  // Undo support for Quick Notes
  const [lastDeletedNote, setLastDeletedNote] = useState<{ id: string; content: string; createdAt: string } | null>(null);
  const [showNoteUndoAlert, setShowNoteUndoAlert] = useState(false);

  // Undo support for Activity Logs
  const [lastDeletedLog, setLastDeletedLog] = useState<{ id: string; timestamp: string; message: string; type?: string } | null>(null);
  const [showLogUndoAlert, setShowLogUndoAlert] = useState(false);
  const [hiddenLogIds, setHiddenLogIds] = useState<string[]>([]);

  const handleDeleteNote = (id: string) => {
    const noteToDelete = quickNotes.find(n => n.id === id);
    if (noteToDelete) {
      setLastDeletedNote(noteToDelete);
      setShowNoteUndoAlert(true);
    }
    const updated = quickNotes.filter(n => n.id !== id);
    setQuickNotes(updated);
    localStorage.setItem("nocode_quick_notes", JSON.stringify(updated));
  };

  const handleUndoNoteDelete = () => {
    if (lastDeletedNote) {
      const restored = [lastDeletedNote, ...quickNotes];
      setQuickNotes(restored);
      localStorage.setItem("nocode_quick_notes", JSON.stringify(restored));
      setLastDeletedNote(null);
      setShowNoteUndoAlert(false);
    }
  };

  const handleDeleteLog = (id: string) => {
    const logToDelete = state.activityLogs?.find(l => l.id === id);
    if (logToDelete) {
      setLastDeletedLog(logToDelete);
      setShowLogUndoAlert(true);
      setHiddenLogIds(prev => [...prev, id]);
    }
  };

  const handleUndoLogDelete = () => {
    if (lastDeletedLog) {
      setHiddenLogIds(prev => prev.filter(hid => hid !== lastDeletedLog.id));
      setLastDeletedLog(null);
      setShowLogUndoAlert(false);
    }
  };

  const [comparisonMetric, setComparisonMetric] = useState("leads");

  const getChannelStats = (channelName: string) => {
    const lower = channelName.toLowerCase();
    const channelPosts = state.posts ? state.posts.filter(p => p.channel?.toLowerCase() === lower || p.channel?.toLowerCase().includes(lower)) : [];
    const postsCount = channelPosts.length;
    
    let baseLeads = 120;
    let baseEngagement = 4.5;
    let baseViews = 2400;

    if (lower.includes("linkedin")) {
      baseLeads = 345;
      baseEngagement = 4.8;
      baseViews = 4500;
    } else if (lower.includes("instagram")) {
      baseLeads = 280;
      baseEngagement = 6.2;
      baseViews = 6200;
    } else if (lower.includes("tiktok")) {
      baseLeads = 190;
      baseEngagement = 7.5;
      baseViews = 12500;
    } else if (lower.includes("youtube")) {
      baseLeads = 410;
      baseEngagement = 5.4;
      baseViews = 8900;
    } else if (lower.includes("twitter") || lower === "x") {
      baseLeads = 150;
      baseEngagement = 3.2;
      baseViews = 3800;
    }

    const dynamicLeads = baseLeads + (postsCount * 35);
    const dynamicEngagement = Math.min(15, parseFloat((baseEngagement + (postsCount * 0.2)).toFixed(1)));
    const dynamicViews = baseViews + (postsCount * 850);

    return {
      postsCount,
      leads: dynamicLeads,
      engagement: dynamicEngagement,
      views: dynamicViews
    };
  };

  const statsA = getChannelStats(channelA);
  const statsB = getChannelStats(channelB);

  const comparisonChartData = [
    {
      name: channelA,
      valor: comparisonMetric === "leads" ? statsA.leads : comparisonMetric === "engagement" ? statsA.engagement : statsA.views,
      color: "#6366f1"
    },
    {
      name: channelB,
      valor: comparisonMetric === "leads" ? statsB.leads : comparisonMetric === "engagement" ? statsB.engagement : statsB.views,
      color: "#10b981"
    }
  ];

  const liveLogs = [...(state.activityLogs || [])];
  lowPerformanceCampaigns.forEach((c, idx) => {
    if (!liveLogs.some(l => l.id === `live-alert-${c.id}`)) {
      liveLogs.unshift({
        id: `live-alert-${c.id}`,
        timestamp: new Date().toISOString(),
        message: `[ALERTA DE CONVERSÃO] Campanha "${c.postTitle}" apresenta apenas ${((c.leads/c.respondidos)*100).toFixed(1)}% de conversão nas últimas 48h (Abaixo do limite de 5%)!`,
        type: "warning" as any
      });
    }
  });

  const handleExportPDF = (mode: "completo" | "resumo") => {
    const doc = new jsPDF();
    
    // Header Bar Styling
    doc.setFillColor(10, 10, 10); // Luxurious Black #0A0A0A
    doc.rect(0, 0, 210, 40, "F");
    
    // Bottom gold divider
    doc.setFillColor(212, 175, 55); // Premium Gold #D4AF37
    doc.rect(0, 40, 210, 3, "F");
    
    // Top-left Corporate Identity
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("OPEN STUDIO", 15, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("DECISION ENGINE & LEAD CONVERSION ANALYTICS", 15, 28);
    
    // Metadata Block
    doc.setTextColor(212, 175, 55); // Gold text for key parameters
    doc.setFontSize(8);
    doc.text(`EXTRACAO EM: ${new Date().toLocaleDateString("pt-BR")}`, 145, 18);
    doc.text(`RESPONSAVEL: ${state.profile?.name?.toUpperCase() || "ARINELCINO"}`, 145, 24);
    doc.setTextColor(161, 161, 170); // Zinc-400
    doc.text(`TIPO DE RELATORIO: ${mode.toUpperCase()}`, 145, 30);
    
    // Title Section
    doc.setTextColor(10, 10, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RELATÓRIO DE INTELIGÊNCIA E PERFORMANCE OPERACIONAL", 15, 55);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(113, 113, 122); // Zinc-500
    doc.text("Consolidação automática dos fluxos de respostas automáticas, detecção de radar e dados de pipeline.", 15, 61);
    
    // Divider line
    doc.setDrawColor(212, 175, 55); // Gold divider
    doc.setLineWidth(0.5);
    doc.line(15, 65, 195, 65);
    
    // Core KPIs section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(10, 10, 10);
    doc.text("Métricas Globais Consolidadas (KPIs)", 15, 75);
    
    const activeCamp = state.campaigns.filter(c => c.status === "Ativa").length;
    const totalCamp = state.campaigns.length;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(63, 63, 70); // Zinc-700
    doc.text(`- Campanhas Ativas de Automação: ${activeCamp} simultâneas (de ${totalCamp} cadastradas)`, 20, 85);
    doc.text(`- Volume Geral de Leads Capturados: ${state.profile.leadsCapturedCount} leads aprovados`, 20, 92);
    doc.text(`- DMs de Atração Enviadas: ${state.profile.dmsSentCount} mensagens síncronas`, 20, 99);
    doc.text(`- Comentários Triados e Respondidos: ${state.profile.repliesMadeCount} respostas automáticas`, 20, 110);
    
    // Performance assessment box
    doc.setFillColor(248, 246, 240); // Soft, warm sand/cream background box
    doc.rect(15, 117, 180, 25, "F");
    
    doc.setTextColor(10, 10, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ASSINATURA DE DESEMPENHO E INSIGHTS DE CONVERSÃO", 20, 123);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(82, 82, 91); // Zinc-600
    const conversionRateAll = state.profile.repliesMadeCount > 0 
      ? ((state.profile.leadsCapturedCount / state.profile.repliesMadeCount) * 100).toFixed(1) 
      : "95.2";
      
    doc.text(`A taxa média de conversão agregada em relação à triagem de comentários está em excelentes ${conversionRateAll}%.`, 20, 129);
    doc.text("O Instagram e a rede de canais LinkedIn lideram a densidade de audiência monitorada.", 20, 135);

    let currentY = 150;
    
    if (mode === "resumo") {
      // 1. Resumo de Crescimento de Leads (jspdf-autotable)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(10, 10, 10);
      doc.text("Demonstrativo de Leads e Conversão (Últimos 30 Dias)", 15, currentY);
      
      const summaryHeaders = [["Dia de Apuração", "Leads Capturados (Acumulado)", "Taxa de Conversão Diária"]];
      const summaryBody = [
        ["11/Mai", `${Math.round(leadsTotalCurrent * 0.35)} contatos`, "74%"],
        ["16/Mai", `${Math.round(leadsTotalCurrent * 0.48)} contatos`, "78%"],
        ["21/Mai", `${Math.round(leadsTotalCurrent * 0.62)} contatos`, "81%"],
        ["26/Mai", `${Math.round(leadsTotalCurrent * 0.74)} contatos`, "85%"],
        ["01/Jun", `${Math.round(leadsTotalCurrent * 0.85)} contatos`, "89%"],
        ["06/Jun", `${Math.round(leadsTotalCurrent * 0.94)} contatos`, "92%"],
        ["10/Jun", `${leadsTotalCurrent} contatos`, "96%"]
      ];

      autoTable(doc, {
        startY: currentY + 4,
        head: summaryHeaders,
        body: summaryBody,
        theme: "striped",
        headStyles: { fillColor: [10, 10, 10], textColor: [212, 175, 55], fontStyle: "bold" },
        styles: { fontSize: 9, font: "helvetica" },
        alternateRowStyles: { fillColor: [248, 246, 240] }
      });
      
      // Let's draw the Sources composition
      const finalY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(10, 10, 10);
      doc.text("Composição das Fontes de Captação", 15, finalY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(63, 63, 70);
      doc.text(`- LinkedIn Comments: ${Math.round(leadsTotalCurrent * 0.40)} contatos qualificados`, 20, finalY + 8);
      doc.text(`- Instagram Posts: ${Math.round(leadsTotalCurrent * 0.25)} contatos ativos`, 20, finalY + 14);
      doc.text(`- TikTok / Outros: ${Math.round(leadsTotalCurrent * 0.35)} contatos`, 20, finalY + 20);

    } else {
      // 2. Completo (Grades Detalhadas de Campanhas e Leads)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(10, 10, 10);
      doc.text("Grade Completa de Campanhas de Automação", 15, currentY);

      const campaignHeaders = [["Campaign/Robot", "Palavra-Chave", "Respondido", "Leads", "Status"]];
      const campaignBody = state.campaigns.map(c => [
        c.postTitle.length > 35 ? c.postTitle.substring(0, 33) + "..." : c.postTitle,
        c.keyword,
        String(c.respondidos),
        String(c.leads),
        c.status
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: campaignHeaders,
        body: campaignBody,
        theme: "grid",
        headStyles: { fillColor: [10, 10, 10], textColor: [212, 175, 55] },
        styles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { top: 15 }
      });

      const secondY = (doc as any).lastAutoTable.finalY + 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(10, 10, 10);
      
      // Handle page break nicely if there is not enough vertical space
      if (secondY > 240) {
        doc.addPage();
        currentY = 25;
      } else {
        currentY = secondY;
      }

      doc.text("Grade Detalhada de Leads Capturados", 15, currentY);

      const leadHeaders = [["Nome do Lead", "Cargo / Organização", "E-mail", "Status Pipeline"]];
      const leadBody = state.leads.slice(0, 30).map(l => [
        l.name,
        `${l.role} @ ${l.company}`,
        l.email,
        l.status
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: leadHeaders,
        body: leadBody,
        theme: "striped",
        headStyles: { fillColor: [10, 10, 10], textColor: [212, 175, 55] },
        styles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: [248, 246, 240] },
        margin: { top: 15 }
      });
    }

    // Footers rendering on every page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(212, 175, 55); // Gold footer rule
      doc.setLineWidth(0.5);
      doc.line(15, 282, 195, 282);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text("Open Studio Automation Platform · Montserrat Style Edition", 15, 288);
      doc.text(`Página ${i} de ${pageCount}`, 175, 288);
    }
    
    doc.save(`open_studio_analytics_report_${mode}_${new Date().toISOString().split("T")[0]}.pdf`);
    setShowExportModal(false);
  };

  const exportToCSV = () => {
    // 1. Leads CSV Content
    let leadsCSV = "Nome,Cargo,Empresa,Email,Telefone,Status,Origem,Data Cadastro\n";
    state.leads.forEach(l => {
      leadsCSV += `"${l.name}","${l.role}","${l.company}","${l.email}","${l.phone || ""}","${l.status}","${l.source}","${l.date}"\n`;
    });

    // 2. Campaigns CSV Content
    let campaignsCSV = "Robo,Titulo do Post,Post Link,Keyword Isca,Respondidos,Pendentes,Total Leads,Status,Criado Em\n";
    state.campaigns.forEach(c => {
      campaignsCSV += `"${c.robot}","${c.postTitle}","${c.postLink}","${c.keyword}","${c.respondidos}","${c.pendentes}","${c.leads}","${c.status}","${c.createdAt}"\n`;
    });

    const combinedCSV = 
      "==== RELATORIO DE CAMPANHAS DE AUTOMACAO ====\n" + 
      campaignsCSV + 
      "\n\n" +
      "==== RELATORIO DE LEADS CAPTURADOS ====\n" + 
      leadsCSV;

    const blob = new Blob([combinedCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `nocode_startup_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeCampCount = state.campaigns.filter(c => c.status === "Ativa").length;
  const totalCampCount = state.campaigns.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alerta de Baixa Conversão */}
      {lowPerformanceCampaigns.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg flex-shrink-0 mt-0.5 md:mt-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">
                Alerta Crítico de Performance de Conversão!
              </h3>
              <p className="text-xs text-red-700 font-medium mt-1 leading-relaxed">
                Temos {lowPerformanceCampaigns.length} campanha(s) apresentando taxa de conversão inferior a <strong>5% nas últimas 48 horas</strong> consecutivas.
                Modifique a palavra-chave isca ou revise o script automatizado.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lowPerformanceCampaigns.map(c => (
                  <span key={c.id} className="bg-red-100/80 text-red-800 border border-red-200/50 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                    {c.postTitle.length > 30 ? c.postTitle.substring(0, 28) + "..." : c.postTitle} ({((c.leads/c.respondidos)*100).toFixed(1)}% cv)
                  </span>
                ))}
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold bg-red-605 text-red-800 border border-red-300 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
            Ação Rápida Requerida
          </span>
        </div>
      )}

      {/* Custom Toast Notification Feedback */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce">
          <div className={`px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-semibold tracking-wide ${
            toastMessage.type === "success" 
              ? "bg-zinc-900 border-zinc-750 text-emerald-400" 
              : toastMessage.type === "error"
              ? "bg-zinc-900 border-zinc-750 text-red-400"
              : "bg-zinc-900 border-zinc-750 text-indigo-400"
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping"></span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Banner and Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
            PAINEL · {currentDateFormatted || "CARREGANDO DATA..."}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mt-1">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            {activeCampCount} campanhas rodando · {state.profile.leadsCapturedCount} leads capturados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-fullscreen"
            onClick={handleFullscreenToggle}
            title="Clique para alternar entre tela normal e tela cheia (Modo Quiosque PDV)"
            className="flex items-center justify-center p-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg transition-all shadow-sm group cursor-pointer"
          >
            {fullscreenMode ? (
              <Minimize2 className="h-8 w-8 md:h-6 md:w-6 transition-all hover:scale-105" style={{ fontSize: "1.25rem" }} />
            ) : (
              <Maximize2 className="h-8 w-8 md:h-6 md:w-6 transition-all hover:scale-105" style={{ fontSize: "1.25rem" }} />
            )}
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm group"
          >
            <Download className="w-4 h-4 text-zinc-500 group-hover:text-zinc-700" />
            <span>Exportar Relatório [CSV]</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm group"
          >
            <Download className="w-4 h-4 text-white/90 group-hover:text-white" />
            <span>Exportar Relatório Geral</span>
          </button>

          <button
            onClick={handleSyncClick}
            disabled={syncing}
            className={`flex items-center gap-2 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
              syncing ? "animate-pulse" : ""
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            <span>Sincronizar</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded font-mono uppercase text-xs scale-90">
              ADMIN
            </span>
          </button>
        </div>
      </div>

      {/* Operações Rápidas ERP Cards Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950 tracking-tight flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded bg-indigo-600 animate-pulse"></span>
            Ações Rápidas & Atalhos do Sistema
          </h2>
          <p className="text-xs text-zinc-500">Ações recorrentes e atalhos rápidos para facilitar a operação e análise de dados no sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card: Registrar Entrada */}
          <div 
            onClick={() => setIsRegistrarEntradaOpen(true)}
            title="Ajustar e reabastecer suprimentos de estoque"
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-150 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300"
          >
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <PlusSquare className="w-5 h-5" />
              </div>
              <span className="text-[9px] bg-emerald-100/80 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">SUP</span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                Registrar Entrada
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-xs text-zinc-450 mt-1 font-medium leading-relaxed">
                Adicione volumes e faça reabastecimento rápido de qualquer mercadoria ou software do catálogo.
              </p>
            </div>
          </div>

          {/* Card: Ver Relatório Geral */}
          <div 
            onClick={() => setIsRelatorioGeralOpen(true)}
            title="Abrir o resumo estatístico consolidado"
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-150 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-300"
          >
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[9px] bg-blue-100/80 text-blue-800 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">F4</span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                Ver Relatório Geral
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-xs text-zinc-450 mt-1 font-medium leading-relaxed">
                Analise históricos de canais, inteligência de leads capturados de mídias e conformidade geral do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>      {/* Analytics Dashboard (Executive Charts Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Leads Distribution by Source */}
        <div className="bg-white border border-zinc-150 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">Distribuição de Leads de Mídias</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Distribuição acumulada de novos leads capturados por canal principal</p>
            </div>
            <span className="text-xs bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-tight">Canais</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { source: "LinkedIn Comments", leads: Math.round(leadsTotalCurrent * 0.55) },
                { source: "YouTube Tutorials", leads: Math.round(leadsTotalCurrent * 0.30) },
                { source: "Blog / SEO", leads: Math.round(leadsTotalCurrent * 0.15) },
                { source: "TikTok / Socials", leads: 48 },
              ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="source" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [value, "Leads Capturados"]} 
                  contentStyle={{ backgroundColor: "#18181b", borderRadius: "12px", border: "none", color: "#fff" }}
                />
                <Bar dataKey="leads" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={45}>
                  <Cell fill="#0A66C2" />
                  <Cell fill="#FF0000" />
                  <Cell fill="#10b981" />
                  <Cell fill="#a855f7" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Interventions/Automation growth */}
        <div className="bg-white border border-zinc-150 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">Evolução Mensal de Interações de Robô</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">Volumetria de respostas automáticas enviadas e DMs disparadas por mês</p>
            </div>
            <span className="text-xs bg-emerald-50 border border-emerald-100/50 text-emerald-700 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-tight">Atividade</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: "Jan", interacoes: 1420 },
                { month: "Fev", interacoes: 1860 },
                { month: "Mar", interacoes: 2280 },
                { month: "Abr", interacoes: 3120 },
                { month: "Mai", interacoes: 4050 },
                { month: "Jun", interacoes: 5210 },
              ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [value, "Respostas Automáticas"]} 
                  contentStyle={{ backgroundColor: "#18181b", borderRadius: "12px", border: "none", color: "#fff" }}
                />
                <Bar dataKey="interacoes" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LinkedIn Results Row */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Resultados LinkedIn</h2>
          <p className="text-xs text-zinc-500">Acumulado de todas as campanhas de comentários e novas DMs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Active Campaigns Card */}
          <div className="bg-white border border-zinc-150 p-5 rounded-xl shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between h-34 relative overflow-visible">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                  Campanhas ativas
                </span>
                <div className="text-2xl font-bold text-zinc-900 mt-2 tracking-tight flex items-center gap-2">
                  {activeCampCount}<span className="text-zinc-300 font-normal font-sans"> / {totalCampCount}</span>
                  {lowPerformanceCampaigns.length > 0 && (
                    <span 
                      className="bg-red-500 text-white text-[11px] font-bold leading-none w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-sm cursor-help" 
                      title="Crítico: Campanhas com conversão abaixo de 5% há mais de 48h!"
                    >
                      !
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Red Sparkline */}
            <div className="h-10 mt-2">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path
                  d="M 0 8 Q 15 5, 30 7 T 60 4 T 80 8 T 100 2"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* DMs Sent Card */}
          <div className="bg-white border border-zinc-150 p-5 rounded-xl shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between h-34">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-zinc-400" />
                  DMs enviadas
                </span>
                <div className="text-2xl font-bold text-zinc-900 mt-2 tracking-tight">
                  {state.profile.dmsSentCount}
                </div>
              </div>
            </div>
            {/* Gray/Indigo Sparkline */}
            <div className="h-10 mt-2">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path
                  d="M 0 9 Q 20 8, 40 5 T 70 8 T 100 4"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Replies Made Card */}
          <div className="bg-white border border-zinc-150 p-5 rounded-xl shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between h-34">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                  Replies feitas
                </span>
                <div className="text-2xl font-bold text-zinc-900 mt-2 tracking-tight">
                  {state.profile.repliesMadeCount}
                </div>
              </div>
            </div>
            {/* Orange/Yellow Sparkline */}
            <div className="h-10 mt-2">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path
                  d="M 0 5 Q 15 8, 30 4 T 50 7 T 75 9 T 100 3"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Leads Captured Card */}
          <div className="bg-white border border-zinc-150 p-5 rounded-xl shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between h-34">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  Leads capturados
                </span>
                <div className="text-2xl font-bold text-zinc-900 mt-2 tracking-tight">
                  {state.profile.leadsCapturedCount}
                </div>
              </div>
            </div>
            {/* Green Sparkline */}
            <div className="h-10 mt-2">
              <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path
                  d="M 0 9 Q 20 8, 40 9 T 60 4 T 80 5 T 100 1"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Crescimento de Leads, Engajamento e Distribuição por Canal (Recharts) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4 border-t border-zinc-105">
        {/* Chart 1: Leads vs. Conversão (Últimos 30 dias) */}
        <div className="bg-white border border-zinc-150 rounded-xl p-5 shadow-2xs hover:border-zinc-300 transition-all text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <LineIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                Performance Operacional
              </span>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight font-sans">Evolução de Conversão ({timeframe})</h3>
            </div>
            
            {/* Timeframe Picker */}
            <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 self-start sm:self-auto">
              {(["7d", "15d", "30d"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    timeframe === t 
                      ? "bg-zinc-900 text-[#D4AF37] shadow-xs" 
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadGrowthData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#8884d8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#D4AF37" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0A0A0A", borderRadius: "12px", border: "1px solid #D4AF37" }}
                  labelStyle={{ color: "#a1a1aa", fontSize: "10px", fontFamily: "monospace" }}
                  itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Area yAxisId="left" type="monotone" dataKey="leads" name="Leads Capturados" stroke="#8884d8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
                <Line yAxisId="right" type="monotone" dataKey="conversao" name="Conversão (%)" stroke="#D4AF37" strokeWidth={2} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribuição de Leads por Canal (Donut) */}
        <div className="bg-white border border-zinc-150 rounded-xl p-5 shadow-2xs hover:border-zinc-300 transition-all text-left space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Origem dos Contatos
              </span>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight font-sans">Leads por Canal de Origem</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded uppercase font-sans">
              Líder: LinkedIn
            </span>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderRadius: "8px", border: "none" }}
                  itemStyle={{ color: "#ffffff", fontSize: "12px", fontWeight: "bold" }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: "10px", color: "#4b5563" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center mt-[-15px]">
              <span className="text-xl font-bold text-zinc-800">{state.profile.leadsCapturedCount}</span>
              <p className="text-[9px] text-zinc-400 font-mono font-semibold uppercase tracking-wider">Total Leads</p>
            </div>
          </div>
        </div>

        {/* Chart 3: Engajamento Médio */}
        <div className="bg-white border border-zinc-150 rounded-xl p-5 shadow-2xs hover:border-zinc-300 transition-all text-left space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                Retenção e Atração
              </span>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight font-sans font-sans">Engajamento Médio (%)</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded uppercase font-sans">
              Melhor: TikTok (7.5%)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={averageEngagementData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="channel" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", borderRadius: "8px", border: "none" }}
                  labelStyle={{ color: "#a1a1aa", fontSize: "10px", fontFamily: "monospace" }}
                  itemStyle={{ color: "#ffffff", fontSize: "12px", fontWeight: "bold" }}
                />
                <Bar dataKey="taxa" name="Taxa de Engajamento (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Side-by-Side Channel Comparison Section */}
      <div id="channel-comparator" className="bg-white border border-zinc-150 rounded-xl p-5 shadow-2xs text-left space-y-4 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="space-y-0.5">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
              Análise Avançada
            </span>
            <h3 className="text-base font-bold text-zinc-900 tracking-tight">Comparação de Desempenho Lado a Lado</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">Mapear por:</span>
            <select
              value={comparisonMetric}
              onChange={(e) => setComparisonMetric(e.target.value)}
              className="text-xs bg-zinc-55 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden font-semibold text-zinc-700"
            >
              <option value="leads">Leads Gerados</option>
              <option value="engagement">Taxa de Engajamento (%)</option>
              <option value="views">Visualizações Estimadas</option>
            </select>
          </div>
        </div>

        {/* Channel Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/55 p-3 rounded-xl border border-zinc-150/40">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 block"></span>
            <label className="text-xs font-semibold text-zinc-650 min-w-16">Canal A:</label>
            <select
              value={channelA}
              onChange={(e) => setChannelA(e.target.value)}
              className="flex-1 text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden text-zinc-800 font-semibold"
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Twitter">Twitter (𝕏)</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 block"></span>
            <label className="text-xs font-semibold text-zinc-650 min-w-16">Canal B:</label>
            <select
              value={channelB}
              onChange={(e) => setChannelB(e.target.value)}
              className="flex-1 text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden text-zinc-800 font-semibold"
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Twitter">Twitter (𝕏)</option>
            </select>
          </div>
        </div>

        {/* Comparison Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-2">
          {/* Recharts Bar Chart */}
          <div className="lg:col-span-3 h-64 border border-zinc-100 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-400 capitalize">
              Gráfico Comparativo de {comparisonMetric === "leads" ? "Leads" : comparisonMetric === "engagement" ? "Engajamento" : "Visualizações"}
            </span>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", borderRadius: "8px", border: "none" }}
                    labelStyle={{ color: "#a1a1aa", fontSize: "10px", fontFamily: "monospace" }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Bar dataKey="valor" fill="#a1a1aa" radius={[4, 4, 0, 0]}>
                    {comparisonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-zinc-550"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> {channelA}</span>
              <span className="flex items-center gap-1.5 text-zinc-550"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {channelB}</span>
            </div>
          </div>

          {/* Side-by-Side Metrics Table/Cards */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-3 text-xs">
            <div className="bg-zinc-50 border border-zinc-150/60 p-3.5 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-zinc-400 tracking-wider uppercase block">Postagens Criadas</span>
                <p className="text-zinc-800 font-bold text-xs">{statsA.postsCount} posts vs {statsB.postsCount} posts</p>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">{statsA.postsCount}</span>
                <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">{statsB.postsCount}</span>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-150/60 p-3.5 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-zinc-400 tracking-wider uppercase block">Leads Capturados</span>
                <p className="text-zinc-800 font-bold text-xs">{statsA.leads} vs {statsB.leads} leads</p>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">{statsA.leads}</span>
                <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">{statsB.leads}</span>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-150/60 p-3.5 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-zinc-400 tracking-wider uppercase block">Engajamento Médio</span>
                <p className="text-zinc-800 font-bold text-xs">{statsA.engagement}% vs {statsB.engagement}%</p>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">{statsA.engagement}%</span>
                <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">{statsB.engagement}%</span>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-150/60 p-3.5 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-zinc-400 tracking-wider uppercase block">Visualizações Totais</span>
                <p className="text-zinc-800 font-bold text-xs">~{statsA.views.toLocaleString()} vs ~{statsB.views.toLocaleString()}</p>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">{(statsA.views/1000).toFixed(1)}k</span>
                <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">{(statsB.views/1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Radar de Hoje Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-105">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Radar de Hoje</h2>
            <p className="text-xs text-zinc-500">Filtragem ativa de inteligência sobre Claude, IA e Automações de mídias</p>
          </div>
          <span className="text-[11px] font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded font-mono">
            Atualizado hoje às {syncTime}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column X (Twitter) */}
          <div className="bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                  <span className="text-xs font-bold text-white">𝕏</span>
                </div>
                <span className="text-sm font-semibold text-zinc-800">Trending 𝕏</span>
              </div>
              <span className="text-[10px] font-medium bg-zinc-150 text-zinc-600 px-1.5 py-0.5 rounded font-mono uppercase">
                3 Sinais
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {state.radar.filter(item => item.platform === "X").map((item) => (
                <div key={item.id} className="bg-white border border-zinc-200/50 p-4 rounded-lg shadow-2xs hover:border-zinc-350 transition-all space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 font-semibold px-1 rounded-sm uppercase tracking-wider">
                      Urgente
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-800 text-left">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 text-left leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-50">
                    <span className="text-[10px] font-mono text-zinc-400">
                      Postando: {item.author}
                    </span>
                    <div className="flex gap-1">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[9px] bg-zinc-100 text-zinc-500 px-1 rounded-md font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column YouTube */}
          <div className="bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600 fill-red-600" />
                <span className="text-sm font-semibold text-zinc-800">YouTube</span>
              </div>
              <span className="text-[10px] font-medium bg-zinc-150 text-zinc-600 px-1.5 py-0.5 rounded font-mono uppercase">
                3 Sinais
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {state.radar.filter(item => item.platform === "YouTube").map((item) => (
                <div key={item.id} className="bg-white border border-zinc-200/50 p-4 rounded-lg shadow-2xs hover:border-zinc-350 transition-all space-y-2">
                  <h3 className="text-xs font-bold text-zinc-800 text-left hover:text-red-600 cursor-pointer transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 text-left leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-50">
                    <span className="text-[10px] font-mono text-zinc-400">
                      Canal: {item.author} · {item.stats}
                    </span>
                    <div className="flex gap-1">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[9px] bg-zinc-100 text-zinc-500 px-1 rounded-md font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column GitHub Trending */}
          <div className="bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-zinc-800" />
                <span className="text-sm font-semibold text-zinc-800">GitHub Trending</span>
              </div>
              <span className="text-[10px] font-medium bg-zinc-150 text-zinc-600 px-1.5 py-0.5 rounded font-mono uppercase">
                3 Sinais
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {state.radar.filter(item => item.platform === "GitHub").map((item) => (
                <div key={item.id} className="bg-white border border-zinc-200/50 p-4 rounded-lg shadow-2xs hover:border-zinc-350 transition-all space-y-2">
                  <div className="flex items-center gap-1.5 rounded-sm bg-zinc-50 px-1.5 py-1 text-[10px] font-mono text-zinc-600">
                    <span className="text-blue-600 font-bold">TypeScript</span>
                    <span className="text-zinc-300">|</span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 text-left leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-50">
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                      ★ {item.stats}
                    </span>
                    <div className="flex gap-1">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[9px] bg-indigo-50 text-indigo-600 px-1 rounded-sm font-mono border border-indigo-100">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        {/* Component 1: Quick Notes */}
        <div id="quick-notes" className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-2xs text-left flex flex-col h-[380px]">
          <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-500 fill-amber-100 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight uppercase font-mono">
                Notas Rápidas e Ideias de Posts
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded uppercase">
              {quickNotes.length} insights
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col space-y-3.5 overflow-hidden">
            {/* Form to Add Note */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Escreva uma ideia de tópico ou lembrete..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                maxLength={180}
                className="flex-1 text-xs text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden placeholder-zinc-400"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-350 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1 shrink-0 shadow-3xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>
            </form>

            {showNoteUndoAlert && lastDeletedNote && (
              <div className="bg-amber-100 border border-amber-200 text-amber-900 rounded-xl px-3 py-2 text-xs flex justify-between items-center animate-fade-in divide-x-0">
                <span>Nota Rápida excluída com sucesso.</span>
                <button
                  type="button"
                  onClick={handleUndoNoteDelete}
                  className="font-bold text-amber-950 underline hover:no-underline font-mono uppercase text-[9.5px]"
                >
                  Confirmar Desfazer (Undo)
                </button>
              </div>
            )}

            {/* List of Notes */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {quickNotes.length > 0 ? (
                quickNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-amber-50/25 border border-amber-150/40 rounded-xl space-y-1.5 relative group hover:border-amber-250 transition-all">
                    <p className="text-xs text-zinc-800 pr-8 whitespace-pre-line leading-relaxed font-sans">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1 border-t border-amber-100/30">
                      <span>{note.createdAt}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(note.content);
                          }}
                          title="Copiar texto da nota"
                          className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition"
                        >
                          <ClipboardCopy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          title="Excluir nota"
                          className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-6 text-center space-y-1.5">
                  <StickyNote className="w-8 h-8 text-zinc-300 stroke-[1.5]" />
                  <p className="text-xs italic text-zinc-400">Nenhum insight pessoal ativo.</p>
                  <p className="text-[10px] text-zinc-400">Grave insights ou rascunhos para posterior criação de post!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Component 2: Activity Logs */}
        <div id="system-logs" className="bg-white border border-zinc-150 rounded-xl overflow-hidden shadow-2xs text-left flex flex-col h-[380px]">
          <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight uppercase font-mono">
                Atividades Automatizadas e Triggers de IA
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded select-none">
              LIVE MONITORING
            </span>
          </div>

          <div className="p-5 divide-y divide-zinc-100/60 overflow-y-auto flex-1">
            {showLogUndoAlert && lastDeletedLog && (
              <div className="bg-rose-50 border border-rose-100 text-rose-900 rounded-xl px-3 py-2 text-xs flex justify-between items-center animate-fade-in mb-3">
                <span>Registro de auditoria ocultado.</span>
                <button
                  type="button"
                  onClick={handleUndoLogDelete}
                  className="font-bold text-rose-950 underline hover:no-underline font-mono uppercase text-[9.5px]"
                >
                  Desfazer Ocultamento (Undo)
                </button>
              </div>
            )}

            {liveLogs && liveLogs.filter(log => !hiddenLogIds.includes(log.id)).length > 0 ? (
              liveLogs.filter(log => !hiddenLogIds.includes(log.id)).map((log) => {
                let typeIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                let typeLabel = "SUCCESS";
                let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                
                if (log.type === "warning") {
                  typeIcon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
                  typeLabel = "WARNING";
                  badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                } else if (log.type === "error") {
                  typeIcon = <XCircle className="w-4 h-4 text-red-500" />;
                  typeLabel = "ERROR";
                  badgeColor = "bg-red-50 text-red-700 border-red-100";
                }
 
                const dateObj = new Date(log.timestamp);
                const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                });
                const formattedDate = dateObj.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit"
                });
 
                return (
                  <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group/log">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-shrink-0">
                        {typeIcon}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-zinc-850 text-left">
                          {log.message}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                          <span>{formattedDate} {formattedTime}</span>
                          <span>•</span>
                          <span className="uppercase text-[9px] font-bold">Automation event</span>
                        </div>
                      </div>
                    </div>
 
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        title="Ocultar evento da auditoria"
                        className="opacity-0 group-hover/log:opacity-100 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
                      </button>

                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded-full uppercase ${badgeColor}`}>
                        {typeLabel}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-400 italic text-center py-12">Nenhum evento ativo registrado no console do container.</p>
            )}
          </div>
        </div>
      </div>

      {/* Hidden printable report formatted with Open Studio branding */}
      <div id="printable-pdf-report" className="hidden print:block p-8 bg-white text-zinc-900 font-sans max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">OPEN STUDIO</h1>
              <p className="text-[10px] font-mono tracking-widest font-bold uppercase text-zinc-500">RELATÓRIO DE ENGAJAMENTO E LEADS</p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-zinc-400">
            <p>DATA: {new Date().toLocaleDateString("pt-BR")}</p>
            <p>SISTEMA: AUTOMATION ENGINE v1.2</p>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-zinc-500">Resumo de Métricas Principais</h2>
          <div className="grid grid-cols-3 gap-4 border border-zinc-200 rounded-xl p-4 bg-zinc-50">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">Total de Leads Capturados</span>
              <p className="text-2xl font-black text-zinc-900">{state.profile.leadsCapturedCount || 450}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">DMs Automatizadas Enviadas</span>
              <p className="text-2xl font-black text-zinc-900">{state.profile.dmsSentCount || 1240}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">Comentários e Respostas</span>
              <p className="text-2xl font-black text-zinc-900">{state.profile.repliesMadeCount || 890}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 text-left">
          <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-zinc-500">Desempenho Geral de Canais Sociais</h2>
          <table className="w-full text-xs text-left text-zinc-700 border-collapse">
            <thead>
              <tr className="border-b border-zinc-300 text-zinc-500 font-mono font-bold">
                <th className="py-2">Canal</th>
                <th className="py-2 text-right">Rascunhos/Posts</th>
                <th className="py-2 text-right">Leads Acumulados</th>
                <th className="py-2 text-right">Engajamento Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {["LinkedIn", "YouTube", "Instagram", "TikTok", "Twitter"].map((channelName) => {
                const stats = getChannelStats(channelName);
                return (
                  <tr key={channelName} className="font-medium">
                    <td className="py-2.5 font-bold text-zinc-900">{channelName}</td>
                    <td className="py-2.5 text-right">{stats.postsCount} posts</td>
                    <td className="py-2.5 text-right">{stats.leads} leads</td>
                    <td className="py-2.5 text-right">{stats.engagement}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 pt-2 text-left">
          <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-zinc-500">Últimos Leads Qualificados Capturados</h2>
          <table className="w-full text-[11px] text-left text-zinc-700 border-collapse">
            <thead>
              <tr className="border-b border-zinc-300 text-zinc-500 font-mono font-bold">
                <th className="py-2">Nome</th>
                <th className="py-2">Empresa / Cargo</th>
                <th className="py-2">Email</th>
                <th className="py-2">Data</th>
                <th className="py-2 text-right">Origem / Campanha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {state.leads.slice(0, 10).map((lead) => (
                <tr key={lead.id}>
                  <td className="py-2 font-bold text-zinc-900">{lead.name}</td>
                  <td className="py-2">{lead.company} / {lead.role}</td>
                  <td className="py-2 font-mono text-[10px] text-zinc-500">{lead.email}</td>
                  <td className="py-2">{lead.date}</td>
                  <td className="py-2 text-right text-zinc-500 truncate max-w-[200px]" title={lead.source}>
                    {lead.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-zinc-200 pt-5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <p>Open Studio Automation Node — Relatório de Auditoria Seguro</p>
          <p>Página 1 de 1</p>
        </div>
      </div>

      {/* Choice PDF Export Modal Overlay */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full shadow-2xl p-6 text-left space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-250 px-2 py-0.5 rounded uppercase tracking-wider">
                  Open Studio PDF Exporter
                </span>
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Exportar Relatório Geral</h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition-all font-mono text-sm leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              Selecione o nível de profundidade analítica para a geração do seu PDF. Ambas as opções contam com o branding corporativo do Open Studio.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {/* Option A: Resumo */}
              <button
                type="button"
                onClick={() => handleExportPDF("resumo")}
                className="flex items-start gap-3 border border-zinc-150 rounded-xl p-3.5 hover:bg-zinc-50 hover:border-zinc-350 transition-all text-left w-full cursor-pointer"
              >
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
                  <LineIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800">Resumo de Performance (Últimos 30 dias)</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                    Foco nos KPIs agregados de leads, taxas médias de conversão síncrona e volumetria acumulada de canais.
                  </p>
                </div>
              </button>

              {/* Option B: Completo */}
              <button
                type="button"
                onClick={() => handleExportPDF("completo")}
                className="flex items-start gap-3 border border-zinc-150 rounded-xl p-3.5 hover:bg-zinc-50 hover:border-zinc-350 transition-all text-left w-full cursor-pointer"
              >
                <div className="p-2 bg-zinc-900 text-white rounded-lg flex-shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800">Completo (Metas, Campanhas e Contatos)</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                    Grade expandida de todas as campanhas, palavras-chave triadas e os últimos 15 leads qualificados ativos.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3.5 py-1.5 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-500 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}



      {/* 2. Modal: Registrar Entrada */}
      {isRegistrarEntradaOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center z-[50] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-150 shadow-2xl p-6 text-left animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <PlusSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-zinc-900 uppercase tracking-wide text-sm">Registrar Entrada no Estoque</h3>
              </div>
              <button 
                onClick={() => setIsRegistrarEntradaOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 font-black text-lg p-1.5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteEntrada} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Selecionar Ativo / Item</label>
                <select 
                  value={entryProductId} 
                  onChange={(e) => setEntryProductId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:border-emerald-400"
                >
                  {getProductsList().map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Atual: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1.5">Unidades a Receber</label>
                <input 
                  type="number" 
                  value={entryQty}
                  min="1"
                  onChange={(e) => setEntryQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsRegistrarEntradaOpen(false)}
                  className="px-4 py-2 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isEntradaLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                >
                  {isEntradaLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <span>Registrar Entrada</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Ver Relatório Geral */}
      {isRelatorioGeralOpen && (
        <div className="fixed inset-0 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center z-[50] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-150 shadow-2xl p-6 text-left animate-in fade-in-50 zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-zinc-900 uppercase tracking-wide text-sm">Relatório Geral de Atividades</h3>
                  <p className="text-[10px] text-zinc-400 font-medium">Histórico e métricas de campanhas de disparos e atração de leads</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRelatorioGeralOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 font-black text-lg p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Ativos Cadastrados</span>
                  <span className="text-base font-bold text-zinc-800 block mt-1">
                    {getProductsList().length} Itens únicos
                  </span>
                </div>
                <span className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Giro Médio de Estoque</span>
                  <span className="text-base font-bold text-zinc-800 block mt-1">
                    {getProductsList().reduce((acc, curr) => acc + curr.stock, 0)} unidades
                  </span>
                </span>
                <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total de Leads Obtidos</span>
                  <span className="text-base font-bold text-indigo-605 block mt-1">
                    {leadsTotalCurrent} Leads
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-2.5">Status Geral das Campanhas do Sistema</h4>
                <div className="border border-zinc-200/80 rounded-xl overflow-hidden bg-zinc-50/50">
                  <table className="w-full text-xs text-zinc-700">
                    <thead className="bg-zinc-100 text-zinc-500 font-bold uppercase text-[9px] border-b border-zinc-200 text-left">
                      <tr>
                        <th className="p-3">Ref ID</th>
                        <th className="p-3">Robô de Automação</th>
                        <th className="p-3 text-center">Palavra-Chave</th>
                        <th className="p-3 text-center">Respondidos</th>
                        <th className="p-3 text-right">Leads Capturados</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-250">
                      {(!state.campaigns || state.campaigns.length === 0) ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-zinc-400 font-medium">
                            Nenhuma campanha configurada no sistema.
                          </td>
                        </tr>
                      ) : (
                        state.campaigns.map((camp: any) => (
                          <tr key={camp.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-indigo-600">{camp.id}</td>
                            <td className="p-3 font-semibold text-zinc-805">{camp.robot}</td>
                            <td className="p-3 text-center font-mono text-zinc-500 bg-zinc-100/50 rounded-md scale-95">{camp.keyword}</td>
                            <td className="p-3 text-center font-medium text-zinc-600">{camp.respondidos}</td>
                            <td className="p-3 text-right font-bold text-emerald-600">{camp.leads}</td>
                            <td className="p-3 text-right font-medium">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                camp.status === "Ativa" ? "bg-emerald-100 text-emerald-800" :
                                camp.status === "Pausada" ? "bg-yellow-105 text-yellow-850" : "bg-zinc-150 text-zinc-550"
                              }`}>
                                {camp.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-zinc-100 mt-auto gap-2">
              <button
                type="button"
                onClick={() => setIsRelatorioGeralOpen(false)}
                className="px-5 py-2 bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 rounded-lg transition-all"
              >
                Fechar Painel Relatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Componente: Calculadora Flutuante */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Toggle Calculator Button */}
        <button
          id="floating-calculator-btn"
          onClick={() => setIsCalcOpen(!isCalcOpen)}
          title="Abrir Calculadora Auxiliar (Atalho: Pressione C)"
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform cursor-pointer border flex items-center justify-center ${
            isCalcOpen 
              ? "bg-red-500 hover:bg-red-600 text-white border-red-300 scale-105" 
              : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-400 hover:scale-110 hover:-rotate-6"
          }`}
        >
          <Calculator className="w-6 h-6 animate-pulse" />
        </button>

        {/* Calculator Widget Panel */}
        {isCalcOpen && (
          <div className="bg-zinc-900 border border-zinc-750 text-white rounded-2xl shadow-2xl p-4 w-60 mt-3 flex flex-col text-left font-mono select-none animate-in fade-in slide-in-from-bottom-5 duration-250">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2.5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-450 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Calculadora Auxiliar
              </span>
              <button 
                onClick={() => setIsCalcOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs py-0.5 px-1 bg-zinc-800 rounded"
              >
                ESC
              </button>
            </div>

            {/* Display screen */}
            <div className="bg-zinc-950 p-3 rounded-lg text-right text-lg font-bold min-h-12 text-emerald-400 overflow-x-auto whitespace-nowrap mb-3 font-mono border border-zinc-800">
              {calcDisplay || "0"}
            </div>

            {/* Buttons Row */}
            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={() => setCalcDisplay("")}
                className="bg-zinc-800 hover:bg-zinc-700 font-bold p-2 text-xs rounded-lg text-red-400"
              >
                C
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev.slice(0, -1))}
                className="bg-zinc-800 hover:bg-zinc-700 font-bold p-2 text-xs rounded-lg text-amber-400"
              >
                ←
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "/")}
                className="bg-zinc-800 hover:bg-zinc-700 font-bold p-2 text-xs rounded-lg text-indigo-400"
              >
                /
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "*")}
                className="bg-zinc-800 hover:bg-zinc-700 font-bold p-2 text-xs rounded-lg text-indigo-400"
              >
                *
              </button>

              <button 
                onClick={() => setCalcDisplay(prev => prev + "7")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                7
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "8")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                8
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "9")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                9
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "-")}
                className="bg-zinc-800 hover:bg-zinc-700 font-bold p-2 text-xs rounded-lg text-indigo-400"
              >
                -
              </button>

              <button 
                onClick={() => setCalcDisplay(prev => prev + "4")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                4
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "5")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                5
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "6")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                6
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "+")}
                className="bg-zinc-800 hover:bg-zinc-700 font-bold p-2 text-xs rounded-lg text-indigo-400"
              >
                +
              </button>

              <button 
                onClick={() => setCalcDisplay(prev => prev + "1")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                1
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "2")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                2
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + "3")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                3
              </button>
              <button 
                onClick={() => {
                  try {
                    // eslint-disable-next-line no-eval
                    const value = eval(calcDisplay);
                    setCalcDisplay(Number.isFinite(value) ? String(Math.round(value*100)/100) : "Erro");
                  } catch (e) {
                    setCalcDisplay("Erro");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 font-bold p-2 text-xs rounded-lg row-span-2 flex items-center justify-center text-white"
              >
                =
              </button>

              <button 
                onClick={() => setCalcDisplay(prev => prev + "0")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg col-span-2"
              >
                0
              </button>
              <button 
                onClick={() => setCalcDisplay(prev => prev + ".")}
                className="bg-zinc-850 hover:bg-zinc-750 font-medium p-2 text-xs rounded-lg"
              >
                .
              </button>
            </div>
            <p className="text-[8px] text-zinc-550 mt-2 text-center uppercase tracking-wide">Pressione C no teclado para ocultar</p>
          </div>
        )}
      </div>

      <PersonalCallNotification 
        onAutoPost={handleAutoPostTrend} 
        onShowToast={triggerToast} 
      />
    </div>
  );
}
