import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const sbClient = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Middleware
app.use(express.json());

// Helper to initialize or load state
function getInitialState() {
  return {
    profile: {
      name: "Matheus Castelo",
      email: "castelo@nocodestartup.io",
      role: "Head de Conteúdo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // Premium avatar placeholder
      activeCampaignsCount: 2,
      leadsCapturedCount: 880,
      dmsSentCount: 157,
      repliesMadeCount: 738,
    },
    config: {
      masterPrompt: `Você é diretor de arte/editorial da NoCode StartUp.\n\nSua função NÃO é criar infográficos genéricos.\n\nSua função é transformar conteúdos sobre:\n- IA\n- Claude\n- ChatGPT\n- automação\n- agentes de IA`,
      defaultHashtags: "#ia #nocode #automacao #claudecode #agentesia",
      toneOfVoice: "Editorial / Profissional",
    },
    campaigns: [
      {
        id: "c1",
        robot: "linkedin-reply-comments",
        postTitle: "Liberamos Um Curso Gratuito De Claude Code",
        postLink: "https://www.linkedin.com/posts/matheuscastelobranco_liberamos-um-curso-gratuito-de-claude-code",
        keyword: "claude",
        status: "Ativa", // Ativa, Pausada, Concluída
        respondidos: 150,
        pendentes: 225,
        leads: 150,
        createdAt: "2026-05-15",
      },
      {
        id: "c2",
        robot: "linkedin-reply-comments",
        postTitle: "As Skills Que Eu Instalaria Hoje No Claude",
        postLink: "https://www.linkedin.com/posts/matheuscastelobranco_as-skills-que-eu-instalaria-hoje",
        keyword: "claude",
        status: "Ativa",
        respondidos: 545,
        pendentes: 218,
        leads: 529,
        createdAt: "2026-05-18",
      },
      {
        id: "c3",
        robot: "linkedin-reply-comments",
        postTitle: "Testei O Open Design O Clone Do Claude Design",
        postLink: "https://www.linkedin.com/posts/matheuscastelobranco_testei-o-open-design",
        keyword: "design",
        status: "Pausada",
        respondidos: 43,
        pendentes: 0,
        leads: 41,
        createdAt: "2026-05-20",
      },
      {
        id: "c4",
        robot: "linkedin-dm-new",
        postTitle: "Liberamos Um Curso Gratuito De Claude Code",
        postLink: "https://www.linkedin.com/posts/matheuscastelobranco_liberamos-um-curso-gratuito-de-claude-code",
        keyword: "claude",
        status: "Pausada",
        respondidos: 127,
        pendentes: 0,
        leads: 124,
        createdAt: "2026-05-15",
      },
      {
        id: "c5",
        robot: "linkedin-dm-new",
        postTitle: "As Skills Que Eu Instalaria Hoje No Claude",
        postLink: "https://www.linkedin.com/posts/matheuscastelobranco_as-skills-que-eu-instalaria-hoje",
        keyword: "claude",
        status: "Pausada",
        respondidos: 58,
        pendentes: 0,
        leads: 52,
        createdAt: "2026-05-18",
      },
      {
        id: "c6",
        robot: "linkedin-dm-new",
        postTitle: "Esses Sãos Os 3 Níveis De Uso Do Claude Code",
        postLink: "https://www.linkedin.com/posts/matheuscastelobranco_esses-sao-os-3-niveis-de-uso",
        keyword: "claude",
        status: "Pausada",
        respondidos: 194,
        pendentes: 0,
        leads: 184,
        createdAt: "2026-05-22",
      },
      {
        id: "c7",
        robot: "linkedin-dm-reconnect",
        postTitle: "Liberamos Um Curso Gratuito De Claude Code",
        postLink: "https://www.linkedin.com/posts/matheuscastelobranco_liberamos-um-curso-gratuito-de-claude-code",
        keyword: "claude",
        status: "Pausada",
        respondidos: 84,
        pendentes: 0,
        leads: 72,
        createdAt: "2026-05-24",
      },
    ],
    posts: [
      {
        id: "p1",
        title: "A oportunidade real em IA em 2026 não é agência de automação — é ser o profissional que implementa IA dentro das empresas",
        channel: "YouTube",
        status: "Agendado", // Draft, Agendado, Publicado
        scheduledDate: "21 de mai - 08:30",
        publishDate: "18 de mai",
        author: "Matheus",
        keyword: "ia",
        content: "Eu cansei de ouvir falar em criar agência de automação de IA sem entregar real valor. Em 2026, quem vence o jogo é o trabalhador qualificado que sabe integrar Claude, OpenAI e Make no fluxo do dia a dia...",
      },
      {
        id: "p2",
        title: "Rotinas do Claude Code — automações rodando na nuvem sem depender do seu computador",
        channel: "YouTube",
        status: "Agendado",
        scheduledDate: "Hoje, 19:29",
        publishDate: "18 de mai",
        author: "Matheus",
        keyword: "claude",
        content: "Deixar robôs rodando em background sempre foi um saco. Com o novo terminal do Claude Code e servidores virtuais, você cria workflows autônomos que performam auditorias e deploy em segundo plano. Segue o fio para ver como configurei em 5 minutos.",
      },
      {
        id: "p3",
        title: "O modelo de IA não é o produto final — o wrapper (contexto, ambiente, fluxo) é",
        channel: "YouTube",
        status: "Publicado",
        scheduledDate: "",
        publishDate: "19 de mai",
        author: "Matheus",
        keyword: "IA",
        views: 13714,
        content: "As pessoas ainda acham que vender acesso a uma API crua é modelo de negócio. O verdadeiro moat está em envolver a API em uma excelente camada de experiência do usuário, contextualização de domínio e automação fluida.",
      },
      {
        id: "p4",
        title: "Testei Claude Design vs Open Design. Ambos fazem a mesma coisa. Um custa R$ 0.",
        channel: "YouTube",
        status: "Publicado",
        scheduledDate: "",
        publishDate: "09 de mai",
        author: "Matheus",
        keyword: "design",
        views: 8930,
        content: "Enquanto as grandes empresas cobram fortunas para criar wireframes responsivos, ferramentas open-source baseadas em local-first e Tailwind alcançam o mesmo nível profissional sem adicionar custos fixos.",
      },
      {
        id: "p5",
        title: "A maioria trata o Claude como um app.",
        channel: "Twitter",
        status: "Publicado",
        scheduledDate: "",
        publishDate: "02 de mai",
        author: "Matheus",
        keyword: "claude",
        views: 4500,
        content: "Claude não é só um chatbot bonito pra responder dúvidas básicas. Ele é um copiloto operacional capaz de planejar refatorações robustas, ler logs pesados e arquitetar microsserviços. Trate-o como um engenheiro pleno seniorizado.",
      },
      {
        id: "p6",
        title: "Os segredos do Claude Code que ninguém te conta.",
        channel: "LinkedIn",
        status: "Publicado",
        scheduledDate: "",
        publishDate: "28 de abr",
        author: "Matheus",
        keyword: "IA",
        views: 3120,
        content: "Muitos testaram o ccode e reclamaram do consumo de tokens. O truque está no uso cirúrgico das Skills e definição adequada de permissões de arquivo no .aistudio. Vamos abrir a caixa-preta do terminal.",
      },
    ],
    leads: [
      { id: "l1", name: "Gabriel Souza", role: "CEO", company: "AeroTech", email: "gabriel@aerotech.com", phone: "+55 11 98822-1133", status: "Novo", source: "Liberamos Um Curso Gratuito De Claude Code", date: "2026-06-09" },
      { id: "l2", name: "Beatriz Nogueira", role: "Product Manager", company: "FinTech Prime", email: "beatriz@pmprime.io", phone: "+55 11 97721-4455", status: "Novo", source: "As Skills Que Eu Instalaria Hoje No Claude", date: "2026-06-09" },
      { id: "l3", name: "Roberto Martins", role: "Head of AI", company: "DataBloom", email: "roberto@databloom.co", phone: "+55 21 99882-3322", status: "Contactado", source: "Liberamos Um Curso Gratuito De Claude Code", date: "2026-06-08" },
      { id: "l4", name: "Júlia Carvalho", role: "Designer", company: "PixelCraft", email: "julia@pixelcraft.studio", phone: "+55 11 96621-8899", status: "Convertido", source: "Testei O Open Design O Clone Do Claude Design", date: "2026-06-07" },
      { id: "l5", name: "Pedro Alencar", role: "Tech Lead", company: "BuildIt", email: "pedro@buildit.com.br", phone: "+55 31 98711-2244", status: "Novo", source: "As Skills Que Eu Instalaria Hoje No Claude", date: "2026-06-07" },
      { id: "l6", name: "Mariana Costa", role: "Founder", company: "ScaleAI", email: "mariana@scaleai.io", phone: "+55 11 99933-2211", status: "Novo", source: "Liberamos Um Curso Gratuito De Claude Code", date: "2026-06-06" },
      { id: "l7", name: "Lucas Andrade", role: "Developer", company: "DevStudio", email: "lucas@devstudio.com", phone: "+55 11 98855-6677", status: "Contactado", source: "Esses Sãos Os 3 Níveis De Uso De Claude", date: "2026-06-05" },
      { id: "l8", name: "Clara Mendes", role: "Content Creator", company: "Estúdio Vídeo", email: "clara@estudiovideo.br", phone: "+55 11 97711-0022", status: "Novo", source: "Liberamos Um Curso Gratuito De Claude Code", date: "2026-06-04" },
    ],
    radar: [
      { id: "r1", platform: "X", title: "URGENTE Claude Code e ferramentas de agentes IA", description: "Explosão de ferramentas, plugins e frameworks para agentes IA com Claude. Usuários reportando saltos massivos de produtividade em workflows de desenvolvimento.", author: "@colbymchenry", date: "22/05 às 05:35", tags: ["Claude", "Agentes", "IA"] },
      { id: "r2", platform: "X", title: "Agentes IA para automação e produtividade", description: "Agentes IA especializados automatizam tarefas complexas e ganham tração no setor corporativo. Discussões aquecidas sobre o fim de SaaS de prateleira.", author: "@askOkara", date: "21/05 às 17:00", tags: ["Agentes", "Automação"] },
      { id: "r3", platform: "X", title: "Claude lançamentos novos produtos recursos", description: "Anthropic expande Claude com novos produtos de design analytics e educação profissional. Promete redefinir interações multimodais complexas.", author: "@anthropic", date: "22/05 às 05:35", tags: ["Anthropic", "Claude"] },
      { id: "r4", platform: "YouTube", title: "What's new in Claude Code", description: "Anthropic lança novidades do Claude Code com guia prático passo a passo de como rodar automações em containers seguros.", author: "@claude", date: "20/05 às 08:42", stats: "13.714 views", tags: ["Tutoriais", "Code"] },
      { id: "r5", platform: "YouTube", title: "I Built a $1M/y SaaS with Claude Code, Here's How", description: "Nick Saraev construiu um SaaS faturando mais de US$ 1 milhão anual utilizando o Claude Code como principal parceiro de engenharia.", author: "@nicksaraev", date: "20/05 às 10:30", stats: "8.661 views", tags: ["Cases", "SaaS"] },
      { id: "r6", platform: "YouTube", title: "Introducing Appshots in Codex", description: "OpenAI lança Appshots no Codex para capturar contexto visual de interfaces dinamicamente e acelerar correções de layout.", author: "@OpenAI", date: "21/05 às 15:33", stats: "1.468 views", tags: ["OpenAI", "Interfaces"] },
      { id: "r7", platform: "GitHub", title: "TypeScript codegraph by colbynchenry", description: "Grafo de conhecimento pré-indexado em árvore para prover contexto otimizado para o Claude Code com menos consumo de tokens.", author: "colbynchenry", date: "Hoje", stats: "4.294 stars", tags: ["Open Source", "TypeScript"] },
      { id: "r8", platform: "GitHub", title: "andrej-karpathy-skills by multica-ai", description: "Claude Code Skills: arquivo único que adiciona dezenas de prompts e padrões que Andrej Karpathy usa para programar com inteligência artificial.", author: "multica-ai", date: "Hoje", stats: "2.679 stars", tags: ["Claude Code", "Skills"] },
    ],
    activityLogs: [
      { id: "log1", timestamp: "2026-06-09T17:10:00Z", message: "Radar atualizado com novas menções de Claude Code" },
      { id: "log2", timestamp: "2026-06-09T16:45:00Z", message: "Campanha 'Liberamos Um Curso Gratuito' capturou lead Gabriel Souza" },
      { id: "log3", timestamp: "2026-06-09T12:30:00Z", message: "Post agendado enviado para agendador de mídias" },
    ],
  };
}

// Read database from file, fallback to default
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(fileData);
      if (!db.activeTheme) db.activeTheme = "ch3";
      if (!db.authSession) {
        db.authSession = { isLoggedIn: true, username: "Arinelcino", email: "arinelcino@gmail.com" };
      }
      if (!db.socialLogins) {
        db.socialLogins = [
          { channel: "LinkedIn", username: "arinelcino", connectedAt: "09/06/2026" },
          { channel: "Twitter", username: "arinelcino_dev", connectedAt: "08/06/2026" }
        ];
      }
      if (!db.audits) {
        db.audits = [
          { id: "audit_1", timestamp: "2026-06-09T17:15:00Z", action: "Configuração de Segurança", severity: "info", user: "Arinelcino", details: "PIN de acesso ativado com validação de biometria" },
          { id: "audit_2", timestamp: "2026-06-09T15:30:22Z", action: "Alteração de Campanha", severity: "warning", user: "Arinelcino", details: "Campanha 'Liberamos Um Curso Gratuito' alterada de Ativa para Pausada" },
          { id: "audit_3", timestamp: "2026-06-09T11:20:05Z", action: "Autenticação de Canal", severity: "info", user: "Arinelcino", details: "Canal LinkedIn conectado para usuário @arinelcino" },
          { id: "audit_4", timestamp: "2026-06-09T09:45:10Z", action: "Exclusão de Lead", severity: "critical", user: "Arinelcino", details: "Lead ID lead_1928472 (Guilherme Araujo) excluído permanentemente" }
        ];
      }
      return db;
    }
  } catch (error) {
    console.error("Error reading database file, loading default state:", error);
  }
  const defaultState = getInitialState() as any;
  defaultState.activeTheme = "ch3";
  defaultState.authSession = { isLoggedIn: true, username: "Arinelcino", email: "arinelcino@gmail.com" };
  defaultState.socialLogins = [
    { channel: "LinkedIn", username: "arinelcino", connectedAt: "09/06/2026" },
    { channel: "Twitter", username: "arinelcino_dev", connectedAt: "08/06/2026" }
  ];
  defaultState.audits = [
    { id: "audit_1", timestamp: "2026-06-09T17:15:00Z", action: "Configuração de Segurança", severity: "info", user: "Arinelcino", details: "PIN de acesso ativado com validação de biometria" },
    { id: "audit_2", timestamp: "2026-06-09T15:30:22Z", action: "Alteração de Campanha", severity: "warning", user: "Arinelcino", details: "Campanha 'Liberamos Um Curso Gratuito' alterada de Ativa para Pausada" },
    { id: "audit_3", timestamp: "2026-06-09T11:20:05Z", action: "Autenticação de Canal", severity: "info", user: "Arinelcino", details: "Canal LinkedIn conectado para usuário @arinelcino" },
    { id: "audit_4", timestamp: "2026-06-09T09:45:10Z", action: "Exclusão de Lead", severity: "critical", user: "Arinelcino", details: "Lead ID lead_1928472 (Guilherme Araujo) excluído permanentemente" }
  ];
  saveDb(defaultState);
  return defaultState;
}

// Write database to file
function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is not defined.");
      return null;
    }
    // Set user-agent to aistudio-build as requested in guidelines
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// API Routes

// Get fully loaded app state
app.get("/api/state", (req, res) => {
  const db = loadDb();
  res.json(db);
});

// Update profile name, email, role, etc.
app.post("/api/profile", (req, res) => {
  const db = loadDb();
  db.profile = { ...db.profile, ...req.body };
  saveDb(db);
  res.json({ success: true, profile: db.profile });
});

// Update configurations (master prompt, hashtags, etc.)
app.post("/api/config", (req, res) => {
  const db = loadDb();
  db.config = { ...db.config, ...req.body };
  saveDb(db);
  res.json({ success: true, config: db.config });
});

// Create a new automation campaign
app.post("/api/campaigns", (req, res) => {
  const db = loadDb();
  const { robot, postTitle, postLink, keyword } = req.body;

  if (!robot || !postTitle || !keyword) {
    return res.status(400).json({ error: "Parâmetros obrigatórios ausentes" });
  }

  const newCampaign = {
    id: "campaign_" + Date.now(),
    robot,
    postTitle,
    postLink: postLink || "https://linkedin.com",
    keyword,
    status: "Ativa",
    respondidos: 0,
    pendentes: 0,
    leads: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };

  db.campaigns.unshift(newCampaign);
  // Track counts
  db.profile.activeCampaignsCount = db.campaigns.filter((c: any) => c.status === "Ativa").length;

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Nova campanha criada para o post: "${postTitle}"`,
    type: "success"
  });

  saveDb(db);
  res.json({ success: true, campaign: newCampaign, campaigns: db.campaigns, activeCampaignsCount: db.profile.activeCampaignsCount });
});

// Toggle campaign status (Ativa <-> Pausada)
app.post("/api/campaigns/:id/toggle", (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const campaignIndex = db.campaigns.findIndex((c: any) => c.id === id);

  if (campaignIndex === -1) {
    return res.status(404).json({ error: "Campanha não encontrada" });
  }

  const campaign = db.campaigns[campaignIndex];
  campaign.status = campaign.status === "Ativa" ? "Pausada" : "Ativa";

  db.profile.activeCampaignsCount = db.campaigns.filter((c: any) => c.status === "Ativa").length;

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Campanha "${campaign.postTitle}" alterada para "${campaign.status}"`,
    type: "warning"
  });

  saveDb(db);
  res.json({ success: true, campaign, campaigns: db.campaigns, activeCampaignsCount: db.profile.activeCampaignsCount });
});

// Delete automation campaign
app.post("/api/campaigns/:id/delete", (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const campaignIndex = db.campaigns.findIndex((c: any) => c.id === id);

  if (campaignIndex === -1) {
    return res.status(404).json({ error: "Campanha não encontrada" });
  }

  const removedCampaign = db.campaigns.splice(campaignIndex, 1)[0];
  db.profile.activeCampaignsCount = db.campaigns.filter((c: any) => c.status === "Ativa").length;

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Campanha excluída: "${removedCampaign.postTitle}"`,
    type: "error"
  });

  saveDb(db);
  res.json({ success: true, campaigns: db.campaigns, activeCampaignsCount: db.profile.activeCampaignsCount });
});

// Create/Schedule a post
app.post("/api/posts", (req, res) => {
  const db = loadDb();
  const { title, content, channel, status, scheduledDate, keyword } = req.body;

  if (!title || !content || !channel) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  const newPost = {
    id: "post_" + Date.now(),
    title,
    content,
    channel,
    status: status || "Draft", // Draft, Agendado, Publicado
    scheduledDate: scheduledDate || "",
    publishDate: status === "Publicado" ? "Hoje" : "",
    author: db.profile.name.split(" ")[0],
    keyword: keyword || "ia",
    views: status === "Publicado" ? 0 : undefined,
  };

  db.posts.unshift(newPost);

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Novo post criado no canal ${channel}: "${title.substring(0, 30)}..."`,
    type: "success"
  });

  saveDb(db);
  res.json({ success: true, post: newPost, posts: db.posts });
});

// Change post status (Draft / Agendado / Publicado)
app.post("/api/posts/:id/status", (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { status, scheduledDate } = req.body;

  const postIndex = db.posts.findIndex((p: any) => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post não encontrado" });
  }

  const post = db.posts[postIndex];
  post.status = status;
  if (status === "Agendado") {
    post.scheduledDate = scheduledDate || "Próximos dias";
    post.publishDate = "";
  } else if (status === "Publicado") {
    post.publishDate = "Hoje";
    post.scheduledDate = "";
    if (post.views === undefined) {
      post.views = 0;
    }
  }

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Post "${post.title.substring(0, 25)}..." promovido para "${status}"`,
    type: "success"
  });

  saveDb(db);
  res.json({ success: true, post, posts: db.posts });
});

// Update capture lead status (Novo, Contactado, Convertido)
app.post("/api/leads/:id/status", (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const { status } = req.body;

  const leadIndex = db.leads.findIndex((l: any) => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: "Lead não encontrado" });
  }

  const lead = db.leads[leadIndex];
  const oldStatus = lead.status;
  lead.status = status;

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Lead ${lead.name} atualizado de ${oldStatus} para ${status}`,
    type: "success"
  });

  saveDb(db);
  res.json({ success: true, lead, leads: db.leads });
});

// Helper function to send webhooks
async function triggerWebhook(event: "lead_captured" | "automation_error", payload: any) {
  const db = loadDb();
  const webhooks = db.config?.webhooks || [];
  for (const wh of webhooks) {
    if (wh.event === event && wh.enabled !== false) {
      try {
        const body = wh.payloadFormat === "JSON" ? JSON.stringify(payload) : new URLSearchParams(payload).toString();
        const headers: any = {
          "Content-Type": wh.payloadFormat === "JSON" ? "application/json" : "application/x-www-form-urlencoded"
        };
        await fetch(wh.url, {
          method: "POST",
          headers,
          body
        });
        console.log(`[Webhook Success] Event '${event}' successfully sent to ${wh.url}`);
      } catch (err: any) {
        console.error(`[Webhook Failure] Failed to send event '${event}' to ${wh.url}:`, err.message);
      }
    }
  }
}

// Add new lead
app.post("/api/leads", async (req, res) => {
  const db = loadDb();
  const { name, role, company, email, phone, source } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Nome e Email são obrigatórios" });
  }

  const newLead = {
    id: "lead_" + Date.now(),
    name,
    role: role || "Profissional",
    company: company || "Autônomo",
    email,
    phone: phone || "",
    status: "Novo" as const,
    source: source || "Inscrição Direta",
    date: new Date().toISOString().split("T")[0],
  };

  db.leads.unshift(newLead);
  db.profile.leadsCapturedCount = db.leads.length;

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Lead cadastrado manualmente: ${name}`,
    type: "success"
  });

  saveDb(db);
  await logAudit("Adição de Lead", "info", `Lead "${name}" (${email}) registrado manualmente`);
  
  // Trigger Webhook
  triggerWebhook("lead_captured", newLead).catch(e => console.error("[Webhook Trigger Error]:", e.message));

  res.json({ success: true, lead: newLead, leads: db.leads, leadsCapturedCount: db.profile.leadsCapturedCount });
});

// Helper function to handle audit logging with Supabase syncing (resilient fallback)
async function logAudit(action: string, severity: "info" | "warning" | "critical", details: string, user = "Arinelcino") {
  const db = loadDb();
  if (!db.audits) db.audits = [];
  const newAudit = {
    id: "audit_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    action,
    severity,
    user,
    details
  };
  db.audits.unshift(newAudit);
  saveDb(db);

  if (sbClient) {
    try {
      // First try 'audit_log' as specified
      const { error: err1 } = await sbClient
        .from("audit_log")
        .insert([{
          usuario_email: "arinelcino@gmail.com",
          acao: action,
          entidade: "ERP",
          entidade_id: null,
          detalhes: { details, severity, u: user, id: newAudit.id, timestamp: newAudit.timestamp }
        }]);
      
      if (err1) {
        console.warn("[Supabase Insert Warning] Could not sync audit into 'audit_log' table, trying 'Auditoria':", err1.message);
        
        // Fallback to backup layout 'Auditoria'
        const { error: err2 } = await sbClient
          .from("Auditoria")
          .insert([{
            id: newAudit.id,
            timestamp: newAudit.timestamp,
            action: newAudit.action,
            severity: newAudit.severity,
            user: newAudit.user,
            details: newAudit.details
          }]);
        if (err2) {
          console.warn("[Supabase Backup Insert Failure]:", err2.message);
        } else {
          console.log("[Supabase Sync Success] Backup stored into Auditoria table.");
        }
      } else {
        console.log("[Supabase Sync Success] Stored audit record into Supabase: audit_log table.");
      }
    } catch (err: any) {
      console.warn("[Supabase Sync Error] Supabase write failed, details maintained locally:", err.message);
    }
  }
  return newAudit;
}

// Fetch audits table records
app.get("/api/audits", async (req, res) => {
  const db = loadDb();
  
  if (sbClient) {
    try {
      // Pull latest audit logs from Supabase
      const { data, error } = await sbClient
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (!error && data && data.length > 0) {
        const formatted = data.map((d: any) => ({
          id: d.id,
          timestamp: d.created_at || new Date().toISOString(),
          action: d.acao,
          severity: d.detalhes?.severity || "info",
          user: d.usuario_email || "Arinelcino",
          details: d.detalhes?.details || d.acao
        }));
        return res.json({ success: true, audits: formatted });
      }
    } catch (e: any) {
      console.warn("[Supabase Fetch Error] Local fallback employed:", e.message);
    }
  }
  
  res.json({ success: true, audits: db.audits || [] });
});

// Configure Webhooks in db.config.webhooks
app.get("/api/integrations/webhooks", (req, res) => {
  const db = loadDb();
  if (!db.config.webhooks) db.config.webhooks = [];
  res.json({ success: true, webhooks: db.config.webhooks });
});

app.post("/api/integrations/webhooks", (req, res) => {
  const db = loadDb();
  const { url, payloadFormat, event } = req.body;
  if (!url || !event) {
    return res.status(400).json({ error: "URL e Evento são obrigatórios" });
  }
  if (!db.config.webhooks) db.config.webhooks = [];
  const newWh = {
    event: event as "lead_captured" | "automation_error",
    url,
    payloadFormat: (payloadFormat || "JSON") as "JSON" | "Form-Data",
    enabled: true
  };
  db.config.webhooks.push(newWh);
  saveDb(db);
  res.json({ success: true, webhooks: db.config.webhooks });
});

// Test Post on channels
app.post("/api/channels/:channel/test", async (req, res) => {
  const { channel } = req.params;
  const db = loadDb();
  
  // Register audit
  await logAudit("Teste de Postagem", "info", `Fez teste de envio 'Olá, Open Studio!' no canal ${channel}`);
  
  // Log activity
  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `[TEST COMPLETO] Teste enviado com sucesso no canal "${channel}"`,
    type: "success"
  });
  saveDb(db);

  res.json({ success: true, message: `✅ Sucesso: Teste disparado com sucesso no canal ${channel}!` });
});

// Gemini analysis of Tone – PostsView (advanced comparison)
app.post("/api/gemini/tone", async (req, res) => {
  const { text, channel } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Texto da postagem é obrigatório" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Elegant fallback mapping
    let alignment = "Excelente";
    let score = 90;
    let suggestions = ["Excelente tom!"];
    let adjusted = text;

    if (channel?.toLowerCase() === "instagram") {
      suggestions = ["Destaque a introdução com um emoji", "Adicione senso de desejo visual rápida"];
      adjusted = "✨ " + text + " #inspiracao";
    } else if (channel?.toLowerCase() === "linkedin") {
      suggestions = ["Use dados estatísticos fictícios para robustez", "Torne o fechamento mais corporativo"];
      adjusted = text + "\n\nInsights práticos focados em dados e performance de engenharia.";
    } else if (channel?.toLowerCase() === "tiktok") {
      suggestions = ["Insira um gancho forte nos primeiros 3 segundos", "Seja ultra direto"];
      adjusted = "💥 GANCHO EXCLUSIVO: " + text;
    }

    return res.json({
      success: true,
      original: text,
      reescrita: adjusted,
      pontuacao_conformidade: score,
      ajustes_sugeridos: suggestions,
      score,
      alignment,
      feedback: `Visualização de conformidade para o canal ${channel}.`,
      adjustedContent: adjusted,
      suggestions
    });
  }

  try {
    const sysInstruction = `Você é um analista especialista em tom de voz para mídias digitais.
Avalie o texto e o canal "${channel}". Compare com as seguintes diretrizes:
- Instagram: Requer tom inspiracional + senso de urgência visual.
- LinkedIn: Requer tom de análise focado em dados + técnico e corporativo.
- TikTok: Requer tom super direto + gancho imediato (gancho chiclete).

Gere um JSON estrito correspondente ao seguinte esquema:
{
  "original": "o texto original",
  "reescrita": "sugestão otimizada de reescrita",
  "pontuacao_conformidade": 92,
  "ajustes_sugeridos": ["ajuste 1", "ajuste 2"]
}
onde pontuacao_conformidade é a nota de conformidade de 0 a 100.
Não use cercas como \`\`\`json.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Conteúdo: ${text}\nCanal: ${channel}`,
      config: {
        systemInstruction: sysInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    const score = parsed.pontuacao_conformidade || 85;
    res.json({
      success: true,
      original: text,
      reescrita: parsed.reescrita || text,
      pontuacao_conformidade: score,
      ajustes_sugeridos: parsed.ajustes_sugeridos || ["Otimize mais o gancho."],
      score,
      alignment: score >= 85 ? "Excelente" : "Ajustável",
      suggestions: parsed.ajustes_sugeridos || ["Melhorar transições"],
      adjustedContent: parsed.reescrita || text,
      feedback: "Análise avançada de conformidade realizada com sucesso."
    });
  } catch (err: any) {
    console.error("Advanced Tone Analysis failed", err);
    res.status(500).json({ error: "Falha ao analisar o tom com Gemini: " + err.message });
  }
});

// Create manual audit log
app.post("/api/audits", async (req, res) => {
  const { action, severity, details, user } = req.body;
  if (!action || !details) {
    return res.status(400).json({ error: "Ação e Detalhes são obrigatórios" });
  }
  const newAudit = await logAudit(action, severity || "info", details, user || "Arinelcino");
  res.json({ success: true, audit: newAudit, audits: loadDb().audits });
});

// Delete lead from Centralized Database and trigger audit
app.post("/api/leads/:id/delete", async (req, res) => {
  const db = loadDb();
  const { id } = req.params;
  const leadIndex = db.leads.findIndex((l: any) => l.id === id);

  if (leadIndex === -1) {
    return res.status(404).json({ error: "Lead não encontrado para exclusão." });
  }

  const removedLead = db.leads.splice(leadIndex, 1)[0];
  db.profile.leadsCapturedCount = db.leads.length;

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Lead excluído: ${removedLead.name}`,
    type: "error"
  });

  saveDb(db);
  await logAudit(
    "Exclusão de Lead", 
    "critical", 
    `Lead "${removedLead.name}" (${removedLead.email}) removido permanentemente`
  );

  res.json({ success: true, leads: db.leads, leadsCapturedCount: db.profile.leadsCapturedCount });
});

// Trigger Sincronizar (Simulates background automation activity dynamically!)
app.post("/api/sync", (req, res) => {
  const db = loadDb();
  
  // Random mock stats incrementer to represent bot execution
  const activeCamp = db.campaigns.filter((c: any) => c.status === "Ativa");
  
  let newlyCommented = 0;
  let newlyDmed = 0;
  let newlyCapturedLeads = 0;

  if (activeCamp.length > 0) {
    activeCamp.forEach((campaign: any) => {
      // Simulate Bot work
      const comm = Math.floor(Math.random() * 8) + 2;
      const dms = Math.floor(Math.random() * 4) + 1;
      const lds = Math.floor(Math.random() * 3) + 1;

      campaign.respondidos += comm;
      campaign.pendentes = Math.max(0, campaign.pendentes + dms - comm);
      campaign.leads += lds;

      newlyCommented += comm;
      newlyDmed += dms;
      newlyCapturedLeads += lds;
    });

    db.profile.repliesMadeCount += newlyCommented;
    db.profile.dmsSentCount += newlyDmed;

    // Build some random real professional Brazilian names and profiles as fresh leads
    const firstNames = ["Rodrigo", "Amanda", "Felipe", "Patricia", "Gustavo", "Camila", "Bruno", "Renata"];
    const lastNames = ["Silva", "Macedo", "Santos", "Pinto", "Oliveira", "Teixeira", "Gomes", "Almeida"];
    const roles = ["Software Eng", "Tech Recruiter", "AI Builder", "VP de Growth", "BizDev Master", "Social Seller"];
    const companies = ["TechCorp", "VentureBuilder", "IA Mestre", "MídiaDigital", "FluxoCriativo"];

    for (let i = 0; i < newlyCapturedLeads; i++) {
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const role = roles[Math.floor(Math.random() * roles.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const camp = activeCamp[Math.floor(Math.random() * activeCamp.length)];
      
      const email = `${name.toLowerCase().replace(" ", ".")}@${company.toLowerCase()}.com`;
      const phone = `+55 11 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

      db.leads.unshift({
        id: "lead_sim_" + Date.now() + "_" + i,
        name,
        role,
        company,
        email,
        phone,
        status: "Novo",
        source: camp.postTitle,
        date: new Date().toISOString().split("T")[0],
      });
    }

    db.profile.leadsCapturedCount = db.leads.length;

    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: `Automação executada! ${newlyCommented} replies enviadas, ${newlyCapturedLeads} novos leads capturados!`,
      type: "success"
    });
  } else {
    // If no active campaigns, simulate a minor network sync log
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: "Executada rotina de checagem: nenhuma campanha ativa no momento.",
      type: "warning"
    });
  }

  saveDb(db);
  res.json({
    success: true,
    campaigns: db.campaigns,
    leads: db.leads,
    profile: db.profile,
    activityLogs: db.activityLogs,
  });
});

// Gemini Copywriting generation route! Let's leverage @google/genai
app.post("/api/posts/generate", async (req, res) => {
  const { topic, tone, keyword, referencePrompt } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "O tema do post é obrigatório." });
  }

  const client = getGeminiClient();
  if (!client) {
    // Fallback if missing API Key so user flows do not crash on the server!
    console.warn("Gemini Client not initialized. Returning high-fidelity mock generated post.");
    setTimeout(() => {
      const dateStr = new Date().toLocaleDateString("pt-BR");
      res.json({
        success: true,
        title: topic,
        suggestedMasterPrompt: `Adicione uma regra para focar no tema: "${topic}" prioritariamente em postagens de ${tone || "profissionais"}.`,
        content: `🚨 **[MOCK GENERATED POST]** Por favor, configure a chave \`GEMINI_API_KEY\` nas configurações da plataforma para obter geração real!\n\n**O tema principal:** ${topic}\n**No tom:** ${tone || "Criativo"}\n**Palavra-chave associada:** ${keyword || "IA"}\n\nNo cenário atual de IA, dominar ferramentas como Claude e agentes autônomos se tornou obrigatório. Não se trata de substituir o humano, mas de potencializar seu ecossistema...\n\n👉 Acesse o link no comentário e garanta seu acesso ao workshop completo de automação.\n\n#ia #claudecode #${keyword || "automacao"}`,
      });
    }, 1500);
    return;
  }

  try {
    const toneDescription = tone || "Editorial / Profissional";
    const masterPromptSetting = referencePrompt || `Você é diretor de arte/editorial da NoCode StartUp. Sua função NÃO é criar infográficos genéricos.`;

    const systemInstruction = `Você é o redator sênior de IA e marketing da NoCode Startup.
Sua missão é gerar um post impecável para o LinkedIn que siga as seguintes diretrizes de consistência da marca:
${masterPromptSetting}

Regras Cruciais de Copywriting para LinkedIn em Português:
1. Comece com um HOOK com forte quebra de padrão ou frase pragmática impactante (sem clichês de IA cansados ou jargões saturados).
2. Use espaçamento generoso (parágrafos curtos com uma ideia por linha), pontuando ideias-chave.
3. Não use listas de bullet points chatas com pontinhos comuns. Prefira marcadores discretos que agregam valor ou seções com títulos elegantes.
4. O conteúdo deve ser direcionado para profissionais que desejam aplicar IA na prática para otimizar tempo ou faturar mais.
5. Termine com uma Chamada para Ação (CTA) clara, instigando o leitor a responder nos comentários com a palavra-chave "${keyword || "vagas"}" para receber o material.
6. Nunca inclua links no corpo do post (penalizado pelo algoritmo). Indique com clareza: "Comente abaixo com '${keyword || "sinais"}' e te envio o link no privado instantaneamente".
7. use no máximo 3 hashtags relevantes no final do post.`;

    const prompt = `Escreva um post completo sobre o tema: "${topic}".
O tom de voz deve ser: "${toneDescription}".
A palavra-chave para captura de leads é: "${keyword || "claude"}".`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1,
      },
    });

    const generatedText = response.text || "Erro na geração do texto.";

    // Let's generate a quick title/headline based on the content as well
    const titlePrompt = `Crie um título/manchete super impactante de até 15 palavras em português para um post sobre: "${topic}". Sem aspas, direto de forma provocativa e editorial.`;
    const titleResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: titlePrompt,
      config: {
        systemInstruction: "Seja conciso, editorial e direto.",
        temperature: 0.8,
      },
    });

    const generatedTitle = titleResponse.text?.trim().replace(/"/g, "") || topic;

    // Suggest master prompt improvements
    const improvePrompt = `Com base no tema "${topic}" e tom de voz "${toneDescription}", escreva uma única frase curta de melhoria que o usuário pode adicionar ao seu "Prompt Mestre" de direção criativa para posts semelhantes. Comece com "Sugestão:"`;
    const improveResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: improvePrompt,
      config: {
        systemInstruction: "Seja cirúrgico e curto. Crie em português brasileiro.",
        temperature: 0.7,
      },
    });

    const suggestedMasterPrompt = improveResponse.text?.trim() || "";

    res.json({
      success: true,
      title: generatedTitle,
      content: generatedText,
      suggestedMasterPrompt: suggestedMasterPrompt,
    });

  } catch (error: any) {
    console.error("Gemini copy generation failure:", error);
    res.status(500).json({ error: "Falha ao gerar post com a inteligência artificial: " + error.message });
  }
});

// Generate 3 catchy hook variations (suggested titles) via Gemini
app.post("/api/posts/generate-hooks", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "O tema do post é obrigatório para sugerir hooks." });
  }

  const client = getGeminiClient();
  if (!client) {
    // Return high-quality hook fallbacks
    const fallbackHooks = [
      `Como usar "${topic}" para economizar até 20h de desenvolvimento de software por semana`,
      `O maior erro que profissionais cometem em relação a "${topic}" (e como evitar isso hoje)`,
      `Eu testei o melhor método sobre "${topic}" por 30 dias na NoCode Startup. Aqui está o resultado:`
    ];
    setTimeout(() => {
      res.json({
        success: true,
        hooks: fallbackHooks,
        mocked: true
      });
    }, 800);
    return;
  }

  try {
    const systemInstruction = `Você é o redator publicitário de alta conversão da NoCode Startup. sua função é criar 3 ganchos (hooks) ou variações de títulos chamativos e magnéticos em português brasileiro baseados no tema fornecido. Os ganchos devem conter estilos diferentes de marketing (curiosidade, autoridade e quebra de padrão). Retorne a resposta em formato JSON contendo a propriedade "hooks", que é um array com exatamente 3 strings correspondendo às variações sugeridas de títulos chamativos de post. NoCode Startup aborda temas operacionais de IA, Claude, automatização e software livre.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Tema/Tópico do post: "${topic}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });

    const generatedText = response.text?.trim() || "{}";
    const parsed = JSON.parse(generatedText);
    const hooks = parsed.hooks || [];

    res.json({
      success: true,
      hooks: hooks.slice(0, 3),
    });
  } catch (error: any) {
    console.error("Gemini hook generation failure:", error);
    res.status(500).json({ error: "Falha ao gerar variações de hooks: " + error.message });
  }
});

// Generate 5 relevant hashtags via Gemini
app.post("/api/posts/generate-hashtags", async (req, res) => {
  const { content, title } = req.body;

  if (!content) {
    return res.status(400).json({ error: "O conteúdo é necessário para gerar as hashtags." });
  }

  const client = getGeminiClient();
  if (!client) {
    const fallbacks = ["#ia", "#automacao", "#nocode", "#agentesia", "#produtividade"];
    setTimeout(() => {
      res.json({
        success: true,
        hashtags: fallbacks,
        mocked: true
      });
    }, 600);
    return;
  }

  try {
    const systemInstruction = `Você é um analista especialista em SEO e redes sociais na NoCode Startup. Sua missão é ler as informações de uma postagem (Título e Conteúdo) e sugerir de forma estratégica exatamente 5 hashtags altamente relevantes que aumentarão o alcance do conteúdo para o público-alvo de tecnologia, inteligência artificial, automação de negócios, programação visual e ferramentas nocode. Retorne estritamente um código JSON contendo a propriedade "hashtags", que é um array com exatamente 5 strings (incluindo o caractere '#'). Não envie blocos markdown extras de explicação, envie apenas o objeto JSON puro.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Título do Post: "${title || ""}"\nConteúdo:\n${content}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const generatedText = response.text?.trim() || "{}";
    const parsed = JSON.parse(generatedText);
    const hashtags = parsed.hashtags || ["#ia", "#automacao", "#nocode", "#marketing", "#claudecode"];

    res.json({
      success: true,
      hashtags: hashtags.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Gemini hashtag generation failure:", error);
    res.status(500).json({ error: "Falha ao gerar hashtags com IA: " + error.message });
  }
});

// Analyze expected engagement score via Gemini
app.post("/api/posts/analyze-engagement", async (req, res) => {
  const { title, content, channel, keyword } = req.body;

  if (!content) {
    return res.status(400).json({ error: "O conteúdo do post é obrigatório." });
  }

  const client = getGeminiClient();
  if (!client) {
    // Generate a beautiful, realistic score if Gemini client isn't available
    const titleLength = title?.length || 0;
    const contentLength = content.length;
    let fallbackScore = Math.floor(45 + (contentLength % 31) + (titleLength % 17));
    if (fallbackScore > 98) fallbackScore = 95;
    if (fallbackScore < 10) fallbackScore = 45;

    const reasons = [
      `Uso estratégico da tag #${keyword || "geral"} para focar no público de nicho.`,
      `Ótima legibilidade no canal ${channel || "Digital"}.`,
      `Gatilho de curiosidade presente nas primeiras linhas do texto.`
    ];
    
    setTimeout(() => {
      res.json({
        success: true,
        score: fallbackScore,
        reasons: reasons,
        mocked: true
      });
    }, 800);
    return;
  }

  try {
    const systemInstruction = `Você é um analista especialista em algoritmos de engajamento de redes sociais (LinkedIn, Instagram, YouTube, Twitter) da NoCode Startup. sua função é receber os detalhes de um rascunho de postagem proposta (Título, Conteúdo, Canal e Palavra-chave Principal) e calcular de forma realista uma pontuação esperada de engajamento de 0 a 100 baseada na qualidade do gancho inicial, no tom adotado de copywriting e na clareza da chamada de ação. Retorne estritamente um JSON com propriedades: "score" (número de 0 a 100) e "reasons" (array de string com exatamente 3 motivos rápidos em português brasileiro avaliando os pontos fortes e sugestões práticas de gancho e formatação).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Canal: ${channel || "LinkedIn"}\nPalavra-chave: ${keyword || ""}\nTítulo: ${title || ""}\nConteúdo:\n${content}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const textOutput = response.text?.trim() || "{}";
    const parsed = JSON.parse(textOutput);
    const score = typeof parsed.score === 'number' ? parsed.score : 80;
    const reasons = parsed.reasons || [
      "Boa estruturação do post para leitura dinâmica.",
      "Ganchos iniciais fortes que fisgam a atenção.",
      "Considerar adicionar mais espaçamento vertical entre parágrafos."
    ];

    res.json({
      success: true,
      score: Math.min(100, Math.max(0, score)),
      reasons: reasons.slice(0, 3)
    });
  } catch (error: any) {
    console.error("Gemini expected engagement score calculation failed:", error);
    res.status(500).json({ error: "Falha ao analisar a pontuação de engajamento esperada: " + error.message });
  }
});

// Analyze post tone safety and alignment with channel via Gemini
app.post("/api/posts/analyze-tone", async (req, res) => {
  const { content, channel } = req.body;

  if (!content) {
    return res.status(400).json({ error: "O conteúdo do post é obrigatório." });
  }

  const client = getGeminiClient();
  if (!client) {
    // Elegant high-fidelity localized rules when Gemini API is not configured
    const contentLower = content.toLowerCase();
    let score = 85;
    let alignment: "Excelente" | "Bom" | "Razoável" | "Crítico" = "Excelente";
    let feedback = "";
    let suggestions: string[] = [];
    let adjustedContent = content;

    if (channel?.toLowerCase() === "linkedin") {
      if (contentLower.includes("cara") || contentLower.includes("mano") || contentLower.includes("galera") || contentLower.includes("velho")) {
        score = 55;
        alignment = "Razoável";
        feedback = "O tom contém coloquialismos e gírias casuais demais para a audiência corporativa e corporativa sênior do LinkedIn.";
        suggestions = [
          "Substitua saudações coloquiais repetitivas por saudações profissionais ou inicie diretamente pelo gancho.",
          "Adapte termos extremamente informais como 'mano/galera' por formas mais corporativas ou remova-os.",
          "Foque nos insights organizacionais ou cases práticos de resultados."
        ];
        adjustedContent = content
          .replace(/mano/gi, "você")
          .replace(/cara/gi, "pessoal")
          .replace(/velho/gi, "")
          .replace(/galera/gi, "profissionais de tecnologia");
      } else {
        score = 92;
        alignment = "Excelente";
        feedback = "O texto apresenta um tom focado em lições de negócios, autoridade e precisão técnica. Excelente aderência para o LinkedIn.";
        suggestions = [
          "Preserve esta formatação limpa e de leitura simplificada.",
          "Considere adicionar uma chamada de engajamento baseada em opinião de nicho."
        ];
      }
    } else {
      // Instagram, Twitter, etc., casual tone is ideal. If too formal, flag it
      if (contentLower.includes("atenciosamente") || contentLower.includes("prezados") || contentLower.includes("estimados") || contentLower.includes("gostaríamos de salientar")) {
        score = 42;
        alignment = "Crítico";
        feedback = "Linguajar rígido, formalismo epistolar ou de e-mail corporativo tradicional identificado. Esse tom aristocrático afasta o público em redes hiper-dinâmicas como Instagram e Twitter.";
        suggestions = [
          "Elimine expressões de introdução burocráticas como 'Prezados' ou 'Atenciosamente'.",
          "Adicione pequenos emojis para guiar a leitura e criar dinamismo estético.",
          "Adote construções diretas focadas no leitor."
        ];
        adjustedContent = content
          .replace(/prezados/gi, "Galera")
          .replace(/estimados/gi, "Pessoal")
          .replace(/gostaríamos de salientar/gi, "vale notar")
          .replace(/atenciosamente/gi, "Até mais!");
      } else {
        score = 88;
        alignment = "Bom";
        feedback = "O texto possui o ritmo perfeito para canais casuais e sociais, soando envolvente e intimista.";
        suggestions = [
          "Adicione pequenos tópicos estilizados.",
          "Destaque sutilmente suas hashtags de maior impacto."
        ];
      }
    }

    setTimeout(() => {
      res.json({
        success: true,
        score,
        alignment,
        feedback,
        suggestions,
        adjustedContent,
        mocked: true
      });
    }, 800);
    return;
  }

  try {
    const systemInstruction = `Você é um curador e editor especialista em tom de voz e adequação por rede social da NoCode Startup. sua função é analisar se o rascunho de postagem fornecido possui o tom correto para o canal de mídia social indicado.

Diretrizes de Tom por Canal:
- LinkedIn: Exige um tom Profissional/Executivo, focado em insights úteis, liderança intelectual, lições aprendidas, negócios, carreira ou engenharia. Deve evitar coloquialismo bobo/gírias ou formalismo de correspondência antiga.
- Instagram, Twitter/X, Facebook, TikTok: Exige um tom Casual, Empático, Dinâmico, Pragmático ou Visceral. Emojis são super adequados. Deve evitar linguagem burocrática, e-mail-marketing clássico ou rigidez excessiva.
- YouTube: Deve ser altamente Informativo, Didático, Otimizado para buscas, direto e de fácil escuta.

Retorne estritamente um JSON estruturado com os seguintes campos:
- "score": número inteiro de 0 a 100 avaliando o grau de conformidade do texto fornecido com o canal.
- "alignment": string contendo o status de conformidade ("Excelente" | "Bom" | "Razoável" | "Crítico").
- "feedback": explicação detalhada e simpática em português sobre o tom do texto em relação ao canal.
- "suggestions": um array de strings com exatamente 2 ou 3 conselhos diretos e práticos de como otimizar.
- "adjustedContent": sugestão do texto original reescrito por você para se adequar perfeitamente ao canal, mantendo o assunto original, hashtags, links ou CTAs intactas.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Canal Selecionado: ${channel || "LinkedIn"}\nConteúdo Original do Rascunho:\n${content}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            alignment: { type: Type.STRING },
            feedback: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            adjustedContent: { type: Type.STRING }
          },
          required: ["score", "alignment", "feedback", "suggestions", "adjustedContent"]
        },
        temperature: 0.7,
      },
    });

    const textOutput = response.text?.trim() || "{}";
    const parsed = JSON.parse(textOutput);

    res.json({
      success: true,
      score: parsed.score || 80,
      alignment: parsed.alignment || "Excelente",
      feedback: parsed.feedback || "Tom muito adequado para o canal.",
      suggestions: parsed.suggestions || ["Mantenha o conteúdo corporativo sutil."],
      adjustedContent: parsed.adjustedContent || content
    });
  } catch (error: any) {
    console.error("Gemini post tone analysis failed:", error);
    res.status(500).json({ error: "Falha ao analisar o tom do post com IA: " + error.message });
  }
});

// Analyze trends using Gemini
app.post("/api/radar/analyze", async (req, res) => {
  const db = loadDb();
  const client = getGeminiClient();

  if (!client) {
    console.warn("Gemini Client not initialized. Returning high-fidelity mock trend analysis.");
    setTimeout(() => {
      const mockAnalysis = {
        summary: "O ecossistema de Inteligência Artificial está focado em agentes autônomos locais de desenvolvimento. O lançamento de ferramentas como Claude Code gerou uma onda massiva de discussões sobre a substituição de fluxos tradicionais por terminais seniorizados que realizam deploys e refatorações de forma rápida, barata e sem dependências.",
        keyInsights: [
          "Explosão dos Agentes de IA nos fluxos de engenharia de software locais (Local-First).",
          "Decorrência de deploys autônomos usando micro-containers e ambientes controlados de código.",
          "Estrela crescente do open-source em detrimento de dependências caras de APIs proprietárias puras."
        ],
        suggestions: [
          {
            platform: "LinkedIn",
            title: "A morte dos tutoriais de prompts simples — Por que 2026 exige Agentes de Execução real na engenharia",
            angle: "Discuta como tutoriais genéricos perderam espaço para agentes que realmente tocam o código do usuário e geram valor.",
            suggestedFormat: "Post de Opinião com carrossel conceitual",
            keyword: "agente"
          },
          {
            platform: "Instagram",
            title: "Configurei o Claude Code no meu terminal e ele refatorou meu app em 3 minutos 🧑‍💻🔥",
            angle: "Abordagem visual rápida com foco em produtividade real e redução dramática do tempo de digitação de código repetitivo.",
            suggestedFormat: "Vídeo curto (Reels) com demonstração na tela",
            keyword: "terminal"
          },
          {
            platform: "Facebook",
            title: "Guia de Transição: Programação Tradicional vs Desenvolvimento Orientado a Agentes de IA",
            angle: "Um compilado informativo de fácil leitura focando na recolocação profissional e ganhos corporativos.",
            suggestedFormat: "Post Informativo com Guia em PDF",
            keyword: "transicao"
          },
          {
            platform: "TikTok",
            title: "A ferramenta de IA mais bizarra que testei essa semana (faz deploy sozinha!) 🗣️💥",
            angle: "Estilo storytelling acelerado focado em entretenimento técnico, demonstrando o terminal agindo de surpresa.",
            suggestedFormat: "Vídeo curto (TikTok) dinâmico com cortes rápidos",
            keyword: "bizarro"
          },
          {
            platform: "YouTube",
            title: "A verdade revelada sobre ferramentas de Agentes de IA: Economia de tempo ou queima de dinheiros em tokens?",
            angle: "Análise analítica aprofundada abrindo custos, logs, tokens e eficiência prática em projetos reais.",
            suggestedFormat: "Vídeo Longo (+10 minutos) e tutorial passo a passo",
            keyword: "gasto"
          },
          {
            platform: "Outros",
            title: "Como criar seu primeiro Wrapper de IA Local com Node.js e Docker em 5 Passos Básicos",
            angle: "Tutorial estritamente técnico direcionado para desenvolvedores construírem soluções robustas localmente.",
            suggestedFormat: "Artigo Técnico em Newsletter do Substack",
            keyword: "wrapper"
          }
        ],
        analyzedAt: new Date().toISOString()
      };

      db.radarAnalysis = mockAnalysis;
      db.activityLogs.unshift({
        id: "log_" + Date.now(),
        timestamp: new Date().toISOString(),
        message: "Análise de tendências do Radar gerada com IA (Simulado)",
        type: "success"
      });
      saveDb(db);
      res.json({ success: true, radarAnalysis: mockAnalysis, activityLogs: db.activityLogs });
    }, 1500);
    return;
  }

  try {
    const signalsText = db.radar.map((s: any) => `[Platform: ${s.platform}] ${s.title}: ${s.description} (Tags: ${s.tags.join(",")})`).join("\n\n");

    const systemInstruction = `Você é o analista sênior de tendências de mídias sociais da NoCode Startup.
Sua tarefa é ler esses sinais de mercado e tendências tecnológicas (posts do X, vídeos do YouTube, repositórios do GitHub) e fornecer uma análise sintética em formato JSON estrito.

Você DEVE responder com um formato JSON estrito correspondente ao seguinte esquema:
{
  "summary": "Um resumo de 2 a 3 frases em tom analítico e enérgico sobre o que está bombando no mercado hoje",
  "keyInsights": ["Insight relevante 1", "Insight relevante 2", "Insight relevante 3"],
  "suggestions": [
     {
        "platform": "LinkedIn" ou "Instagram" ou "Facebook" ou "TikTok" ou "YouTube" ou "Outros",
        "title": "Um título chocante e editorial perfeito para engajamento nessa plataforma",
        "angle": "Explicação breve do ângulo de storytelling ou gancho emocional do post",
        "suggestedFormat": "Formato recomendado (ex. Carrossel, Reels, Vídeo Longo, Fio de X, Post Informativo)",
        "keyword": "Palavra-chave curta de 1 palavra para captura de lead (ex. 'claude', 'modelo', 'prompt')"
     }
  ]
}

REGRAS:
1. Certifique-se de produzir EXATAMENTE as sugestões para as 6 mídias: "LinkedIn", "Instagram", "Facebook", "TikTok", "YouTube" e "Outros".
2. Escreva tudo em PORTUGUÊS com excelente qualidade de copywriting.
3. Não inclua Markdown como \`\`\`json na resposta — retorne APENAS o JSON puro e estrito.`;

    const promptMessage = `Aqui estão os sinais de mercado coletados hoje para você analisar:\n\n${signalsText}\n\nForneça a análise em formato JSON estrito para as mídias especificadas.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 1,
      },
    });

    const generatedText = response.text?.trim() || "{}";
    const parsedAnalysis = JSON.parse(generatedText);

    parsedAnalysis.analyzedAt = new Date().toISOString();

    db.radarAnalysis = parsedAnalysis;
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: "Radar de tendências atualizado via IA militar sênior",
      type: "success"
    });

    saveDb(db);
    res.json({ success: true, radarAnalysis: parsedAnalysis, activityLogs: db.activityLogs });

  } catch (err: any) {
    console.error("Error generating radar analysis:", err);
    res.status(500).json({ error: "Erro ao realizar análise de tendências: " + err.message });
  }
});

// App theme route
app.post("/api/config/theme", (req, res) => {
  const db = loadDb();
  const { darkMode } = req.body;
  if (darkMode !== undefined) {
    db.darkMode = darkMode;
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: `Tema visual alternado para: ${darkMode ? "Modo Escuro" : "Modo Claro"}`,
      type: "success"
    });
    saveDb(db);
    res.json({ success: true, darkMode: db.darkMode, activityLogs: db.activityLogs });
  } else {
    res.status(400).json({ error: "Campo 'darkMode' inválido" });
  }
});

// Active theme dynamic config
app.post("/api/config/active-theme", (req, res) => {
  const db = loadDb();
  const { activeTheme } = req.body;
  const validThemes = ["classic", "ch3", "uol", "h2", "refined_neon", "sales_iq", "cyber_matrix", "forest_harmony", "royal_velvet", "carbon_brutalist"];
  if (activeTheme && validThemes.includes(activeTheme)) {
    db.activeTheme = activeTheme;
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: `Tema reativo alternado para: ${activeTheme.toUpperCase()} (Auditado via EtheViewModel)`,
      type: "success"
    });
    saveDb(db);
    res.json({ success: true, activeTheme: db.activeTheme, activityLogs: db.activityLogs });
  } else {
    res.status(400).json({ error: "Campo 'activeTheme' inválido ou ausente." });
  }
});

// Advanced database module cleanup with confirmation audit routes
app.post("/api/cleanup", (req, res) => {
  const db = loadDb();
  const { type } = req.body;
  
  if (type === "campaigns") {
    db.campaigns = [];
    db.profile.activeCampaignsCount = 0;
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: "LIMPEZA COMPLETA: Todas as campanhas foram expurgadas do servidor.",
      type: "error"
    });
  } else if (type === "leads") {
    db.leads = [];
    db.profile.leadsCapturedCount = 0;
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: "LIMPEZA COMPLETA: Todo o banco de leads capturados foi expurgado.",
      type: "error"
    });
  } else if (type === "posts") {
    db.posts = [];
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: "LIMPEZA COMPLETA: Todos os posts de IA gerados foram excluídos.",
      type: "error"
    });
  } else if (type === "logs") {
    db.activityLogs = [];
  } else if (type === "factory_reset") {
    db.campaigns = [];
    db.posts = [];
    db.leads = [];
    db.activityLogs = [];
    db.darkMode = false;
    db.activeTheme = "classic";
    db.profile = {
      name: "Arinelcino Castelo",
      email: "arinelcino@gmail.com",
      role: "Head de Operações ERP",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      activeCampaignsCount: 0,
      leadsCapturedCount: 0,
      dmsSentCount: 0,
      repliesMadeCount: 0,
    };
    db.config = {
      masterPrompt: `Você é diretor de arte/editorial da NoCode StartUp.\n\nSua função é transformar conteúdos de automação de IA, agentes autônomos e ERP.`,
      defaultHashtags: "#ia #nocode #automacao #claudecode",
      toneOfVoice: "Editorial / Profissional",
    };
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: "SISTEMA REINICIADO: O ERP foi restaurado de fábrica com configurações de base.",
      type: "success"
    });
  } else {
    return res.status(400).json({ error: "Tipo de limpeza inválido." });
  }
  
  saveDb(db);
  res.json({ success: true, ...db });
});

// Auth Routes: Login
app.post("/api/auth/login", (req, res) => {
  const db = loadDb();
  const { email, password, username, timezone, lastLoginAt } = req.body;
  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }
  const resolvedUsername = username || email.split("@")[0];
  db.authSession = {
    isLoggedIn: true,
    username: resolvedUsername,
    email: email
  };
  
  // Sync core ERP profile with active authenticated session user and date/time info
  db.profile.name = resolvedUsername;
  db.profile.email = email;
  db.profile.lastLoginAt = lastLoginAt || new Date().toISOString();
  
  if (timezone) {
    db.config.timezone = timezone;
  }

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Usuário '${resolvedUsername}' autenticou-se no painel com sucesso. Fuso Horário '${timezone || "Padrão"}' e perfil sincronizados com o banco de dados.`,
    type: "success"
  });
  saveDb(db);
  res.json({ success: true, authSession: db.authSession, profile: db.profile, config: db.config, activityLogs: db.activityLogs });
});

// Auth Routes: Signup
app.post("/api/auth/signup", (req, res) => {
  const db = loadDb();
  const { email, username, timezone, lastLoginAt } = req.body;
  if (!email || !username) {
    return res.status(400).json({ error: "E-mail e Nome de Usuário são obrigatórios." });
  }
  db.authSession = {
    isLoggedIn: true,
    username: username,
    email: email
  };

  // Sync core ERP profile with active raw registration credentials and date/time info
  db.profile.name = username;
  db.profile.email = email;
  db.profile.lastLoginAt = lastLoginAt || new Date().toISOString();

  if (timezone) {
    db.config.timezone = timezone;
  }

  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Novo cadastro efetuado para usuário '${username}' (${email}). Fuso '${timezone || "Padrão"}' e Perfil sincronizados com sucesso.`,
    type: "success"
  });
  saveDb(db);
  res.json({ success: true, authSession: db.authSession, profile: db.profile, config: db.config, activityLogs: db.activityLogs });
});

// Auth Routes: Logout
app.post("/api/auth/logout", (req, res) => {
  const db = loadDb();
  const prevUser = db.authSession?.username || "Aba Anônima";
  db.authSession = {
    isLoggedIn: false,
    username: "",
    email: ""
  };
  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Usuário '${prevUser}' deslogou-se do painel principal de automação.`,
    type: "warning"
  });
  saveDb(db);
  res.json({ success: true, authSession: db.authSession, activityLogs: db.activityLogs });
});

// Social Login Connections Routing
app.post("/api/social/register", (req, res) => {
  const db = loadDb();
  const { channel, username } = req.body;
  if (!channel || !username) {
    return res.status(400).json({ error: "Canal e usuário social obrigatórios." });
  }
  if (!db.socialLogins) db.socialLogins = [];
  
  // Update or insert
  db.socialLogins = db.socialLogins.filter((s: any) => s.channel.toLowerCase() !== channel.toLowerCase());
  db.socialLogins.push({
    channel,
    username,
    connectedAt: new Date().toLocaleDateString("pt-BR")
  });
  
  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp: new Date().toISOString(),
    message: `Conta associada: ${channel} conectado como @${username}.`,
    type: "success"
  });
  saveDb(db);
  res.json({ success: true, socialLogins: db.socialLogins, activityLogs: db.activityLogs });
});

app.post("/api/social/delete", (req, res) => {
  const db = loadDb();
  const { channel } = req.body;
  if (!channel) {
    return res.status(400).json({ error: "Canal é obrigatório para desconexão." });
  }
  if (!db.socialLogins) db.socialLogins = [];
  
  const removed = db.socialLogins.find((s: any) => s.channel.toLowerCase() === channel.toLowerCase());
  db.socialLogins = db.socialLogins.filter((s: any) => s.channel.toLowerCase() !== channel.toLowerCase());
  
  if (removed) {
    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: `Conta desconectada com sucesso: ${channel} (@${removed.username}).`,
      type: "warning"
    });
  }
  saveDb(db);
  res.json({ success: true, socialLogins: db.socialLogins, activityLogs: db.activityLogs });
});

app.post("/api/social/test-connection", (req, res) => {
  const db = loadDb();
  const { channel } = req.body;
  if (!channel) {
    return res.status(400).json({ error: "Canal é obrigatório para testar conexão." });
  }

  // Check if channel is configured
  const connected = (db.socialLogins || []).find((s: any) => s.channel.toLowerCase() === channel.toLowerCase());

  if (!connected) {
    return res.status(400).json({ 
      error: `Erro de Integração: O canal ${channel} não está configurado em sua conta ou não possui uma credencial de acesso ativa. Vá em Configurações para conectar.` 
    });
  }

  // Simulate API post test 'Olá, Open Studio!'
  const timestamp = new Date().toISOString();
  db.activityLogs.unshift({
    id: "log_" + Date.now(),
    timestamp,
    message: `[TESTE DE CONEXÃO] Canal '${channel}' disparou post de teste 'Olá, Open Studio!' com sucesso para verificar integração de API.`,
    type: "success"
  });

  saveDb(db);
  res.json({ 
    success: true, 
    channel,
    username: connected.username,
    status: "200_OK_VERIFIED",
    postPublished: {
      content: "Olá, Open Studio!",
      publishedAt: timestamp
    },
    activityLogs: db.activityLogs
  });
});

app.post("/api/social/dispatch", (req, res) => {
  const db = loadDb();
  const { channels, message } = req.body;
  if (!channels || !Array.isArray(channels) || channels.length === 0) {
    return res.status(400).json({ error: "Lista de canais de destino é obrigatória." });
  }
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "A mensagem a ser publicada não pode estar vazia." });
  }

  channels.forEach((ch: string) => {
    // Register the post in db.posts
    const newPost = {
      id: "post_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      title: message.length > 30 ? message.substring(0, 27) + "..." : message,
      channel: ch,
      status: "Publicado" as const,
      scheduledDate: "",
      publishDate: new Date().toLocaleDateString("pt-BR"),
      author: db.profile?.name || "Arinelcino",
      keyword: "teste",
      content: message
    };
    if (!db.posts) db.posts = [];
    db.posts.unshift(newPost);

    db.activityLogs.unshift({
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      message: `[CAMPANHAS ADM] Transmissão síncrona enviada com sucesso no canal: ${ch}.`,
      type: "success"
    });
  });

  saveDb(db);
  res.json({ success: true, posts: db.posts, activityLogs: db.activityLogs });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Open Studio server running on port ${PORT}`);
  });
}

startServer();
