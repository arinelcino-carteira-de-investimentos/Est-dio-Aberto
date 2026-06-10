import { useState } from "react";
import { 
  Copy, 
  Check, 
  Save, 
  Palette, 
  Sparkles, 
  Eye, 
  Settings, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Layout,
  X
} from "lucide-react";
import { AppState } from "../types";

interface ImagesViewProps {
  state: AppState;
  activeChannel: string;
  onUpdateConfig: (config: any) => Promise<void>;
}

interface DesignTemplate {
  id: string;
  title: string;
  subtitle: string;
  sections: Array<{ type: "intro" | "points" | "outro"; heading?: string; items?: string[]; content?: string }>;
  accentColor: string;
}

export default function ImagesView({ state, activeChannel, onUpdateConfig }: ImagesViewProps) {
  const [copied, setCopied] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptText, setPromptText] = useState(state.config.masterPrompt);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePrompt = async () => {
    setSaving(true);
    try {
      await onUpdateConfig({ masterPrompt: promptText });
      setEditingPrompt(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // High quality templates of references that we render interactively using pure gorgeous CSS!
  const referenceTemplates: DesignTemplate[] = [
    {
      id: "ref1",
      title: "Esses são os 3 níveis de uso do Claude Code.",
      subtitle: "Em qual você está? (O nível 1 é onde a maioria para)",
      accentColor: "from-red-500 to-amber-500",
      sections: [
        {
          type: "points",
          heading: "Os Níveis de Domínio:",
          items: [
            "01 INICIANTE: Saber como usar as ferramentas fundamentais (Claude, OpenAI e Make) para responder dores diárias básicas.",
            "02 INTERMEDIÁRIO: Criar scripts com subdomínios, orquestrar fluxos locais, versionar em repositórios, automatizar commits.",
            "03 AVANÇADO: Construir Sistemas Operacionais de Agentes de IA que performam tarefas comerciais complexas autonomamente."
          ]
        },
        {
          type: "outro",
          content: "Seja honesto consigo mesmo. Comente 'Nivel' abaixo e te apresento o caminho para sair do amadorismo."
        }
      ]
    },
    {
      id: "ref2",
      title: "Testei Claude Design vs Open Design.",
      subtitle: "Ambos fazem a mesma coisa. Mas um custa R$ 0.",
      accentColor: "from-blue-600 to-indigo-600",
      sections: [
        {
          type: "points",
          heading: "Claude Design (Fechado):",
          items: [
            "Excelente, mas limitado",
            "Tarifas complexas baseadas em uso de tokens",
            "Preso na nuvem fechada deles"
          ]
        },
        {
          type: "points",
          heading: "Open Design (Livre):",
          items: [
            "Código aberto e extensível",
            "Roda no seu próprio servidor local",
            "Customizável com qualquer framework ou API"
          ]
        },
        {
          type: "outro",
          content: "Comente 'DESIGN' e te envio o passo a passo com o repositório aberto para rodar em 5 minutos."
        }
      ]
    },
    {
      id: "ref3",
      title: "O modelo de IA não é o produto final.",
      subtitle: "Por que 95% das startups de IA vão quebrar este ano.",
      accentColor: "from-purple-600 to-pink-600",
      sections: [
        {
          type: "intro",
          content: "A maioria das startups de IA é apenas um wrapper fino em cima do GPT-4 ou Claude. Cobram caro por uma coisa que o cliente final pode fazer de graça se souber criar prompts."
        },
        {
          type: "points",
          heading: "O verdadeiro moat competitivo:",
          items: [
            "A experiência do usuário (UX) totalmente customizada",
            "O ecossistema proprietário de dados conectados",
            "Automação embarcada em background"
          ]
        }
      ]
    },
    {
      id: "ref4",
      title: "As Skills que eu instalaria hoje no Claude Code.",
      subtitle: "Supercarregue seu terminal com agilidade extrema.",
      accentColor: "from-emerald-600 to-teal-600",
      sections: [
        {
          type: "points",
          heading: "Minhas Skills Essenciais:",
          items: [
            "skill-code-audit: Audita vulnerabilidade de repositórios dinamicamente em segundos.",
            "skill-auto-docs: Mantém wiki de engenharia sincronizada conforme novos commits são validados.",
            "skill-lighthouse-check: Garante SEO, performance de imagem e acessibilidade antes de ir pra produção."
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page Header */}
      <div className="border-b border-zinc-100 pb-5">
        <span className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">
          {activeChannel} · REFERÊNCIA VISUAL
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
          Geração de Imagens
        </h1>
        <p className="text-sm text-zinc-500 mt-1 font-medium">
          Sua marca segue diretrizes editoriais específicas da NoCode Startup para {activeChannel}. Use seu modelo favorito para as imagens, ele entende direção de arte.
        </p>
      </div>

      {/* How to use Step Banner */}
      <div className="bg-orange-50/70 border border-orange-100 p-4 rounded-xl space-y-2">
        <span className="text-[10px] font-mono font-bold text-orange-700 tracking-wider uppercase block">
          COMO USAR O KIT DE CONSISTÊNCIA
        </span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          {[
            { step: "1", title: "Copie o prompt mestre", desc: "Use o botão abaixo para extrair a instrução." },
            { step: "2", title: "Baixe uma referência", desc: "Escolha um estilo visual abaixo como guia." },
            { step: "3", title: "Abra o ChatGPT / DALL-E", desc: "Abra a ferramenta dedicada de imagens." },
            { step: "4", title: "Cole o prompt + texto", desc: "Copie e descreva o post para renderizar." }
          ].map((item, i) => (
            <div key={i} className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-zinc-800">{item.title}</h4>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Mestre section */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-zinc-700" />
            <span className="text-xs font-bold text-zinc-800 tracking-wide uppercase font-mono">
              PROMPT MESTRE (Direção Editorial)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!editingPrompt ? (
              <button
                onClick={() => setEditingPrompt(true)}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 border px-2.5 py-1 rounded-md bg-white transition"
              >
                Editar Regras
              </button>
            ) : (
              <button
                onClick={handleSavePrompt}
                disabled={saving}
                className="text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1 rounded-md transition flex items-center gap-1"
              >
                {saving ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span>Salvar</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-red-600 text-white hover:bg-red-700 px-3.5 py-1 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-5 bg-zinc-900 text-zinc-100 font-mono text-xs leading-relaxed text-left">
          {editingPrompt ? (
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={6}
              className="w-full bg-zinc-950 text-emerald-400 border border-zinc-805 rounded p-3 focus:outline-hidden focus:ring-1 focus:ring-zinc-700"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-emerald-400 select-all">
              {promptText}
            </pre>
          )}
        </div>
      </div>

      {/* Imagens de Referência section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-md font-bold text-zinc-800 tracking-tight flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-zinc-650" />
            Imagens de Referência (Diretivas Visuais)
          </h2>
          <p className="text-xs text-zinc-500">Escolha um dos layouts editoriais abaixo para abrir o visualizador interativo em alta fidelidade.</p>
        </div>

        {/* Grid referencing beautiful mockups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {referenceTemplates.map((tpl) => (
            <div 
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl)}
              className="bg-white border border-zinc-150 rounded-xl overflow-hidden hover:border-zinc-350 cursor-pointer transition-all shadow-3xs group flex flex-col justify-between h-56"
            >
              {/* Dummy Layout Visual representation */}
              <div className={`h-32 bg-gradient-to-r ${tpl.accentColor} p-4 flex flex-col justify-between text-white relative overflow-hidden`}>
                <div className="w-2.5 h-2.5 rounded-full bg-white/40 absolute -right-0.5 -top-0.5 scale-150"></div>
                
                <span className="text-[7.5px] font-bold tracking-widest font-mono uppercase bg-white/20 px-1.5 py-0.5 rounded mr-auto">
                  Consistência NoCode
                </span>

                <h4 className="text-[11px] font-extrabold tracking-tight leading-snug line-clamp-3">
                  {tpl.title}
                </h4>
              </div>

              {/* Title descriptions */}
              <div className="p-3 bg-zinc-50 border-t border-zinc-150 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-800 line-clamp-1">
                    {tpl.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2 mt-0.5">
                    {tpl.subtitle}
                  </p>
                </div>
                <div className="text-[10px] text-[#0A66C2] font-semibold flex items-center justify-end gap-1 group-hover:underline pt-2">
                  <span>Visualizar Layout</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Layout Mockup Visualizer Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fade-in">
          <div className="bg-zinc-100 rounded-3xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col justify-between border border-zinc-200 p-6 space-y-4 shadow-2xl">
            {/* Header controller */}
            <div className="flex items-center justify-between border-b border-zinc-205 pb-3">
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Visualizador de Layout • NoCode Startup Guidelines
              </span>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="bg-zinc-200 hover:bg-zinc-300 p-1.5 rounded-full text-zinc-750 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visualizer content display */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Reference description */}
              <div className="md:col-span-2 space-y-4 text-left">
                <div className="space-y-1">
                  <h3 className="text-md font-bold text-zinc-800">{selectedTemplate.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{selectedTemplate.subtitle}</p>
                </div>

                <div className="space-y-2 text-xs text-zinc-650">
                  <span className="font-bold text-zinc-700 block">Dicas de Implementação:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Utilize proporção quadrada (1:1) ou vertical de stories (9:16).</li>
                    <li>Sempre use tipografia em escala robusta (como Outfit ou Space Grotesk).</li>
                    <li>As listas devem ter espaçamentos confortáveis e cor de fundo contrastante.</li>
                    <li>Evite sombras genéricas. Prefira bordas planas e limpas de 1px.</li>
                  </ul>
                </div>
              </div>

              {/* RENDERED HIGH-FIDELITY LAYOUT */}
              <div className="md:col-span-3 bg-white border border-zinc-300 rounded-2xl shadow-lg aspect-square max-w-md mx-auto p-8 flex flex-col justify-between text-left select-none relative">
                {/* Accent Color Band */}
                <div className={`absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r ${selectedTemplate.accentColor}`}></div>

                {/* Upper row logo */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center">
                      <span className="text-[9px] text-white font-bold">N</span>
                    </div>
                    <span className="text-[9px] font-black tracking-widest font-mono text-zinc-800">
                      NoCode StartUp
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">
                    #Consistencia
                  </span>
                </div>

                {/* Centered Big Editorial Typography */}
                <div className="space-y-4 my-auto">
                  <h2 className="text-2xl font-black text-zinc-900 leading-tight tracking-tight font-sans">
                    {selectedTemplate.title}
                  </h2>
                  <p className="text-zinc-550 text-xs font-semibold leading-relaxed">
                    {selectedTemplate.subtitle}
                  </p>

                  {/* Sections of layouts */}
                  {selectedTemplate.sections.map((sec, i) => (
                    <div key={i} className="space-y-2 pt-2">
                      {sec.heading && (
                        <h4 className="text-[10px] font-black font-mono tracking-wider text-zinc-400 uppercase">
                          {sec.heading}
                        </h4>
                      )}
                      
                      {sec.type === "points" && sec.items && (
                        <div className="space-y-1.5">
                          {sec.items.map((pt, idx) => (
                            <div key={idx} className="bg-zinc-50 border border-zinc-150 p-3 rounded-lg text-[10px] text-zinc-700 font-sans leading-relaxed font-medium">
                              {pt}
                            </div>
                          ))}
                        </div>
                      )}

                      {sec.type === "intro" && sec.content && (
                        <p className="text-[11px] text-zinc-650 leading-relaxed italic">
                          "{sec.content}"
                        </p>
                      )}

                      {sec.type === "outro" && sec.content && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-[10px] text-red-700 font-bold">
                          {sec.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Brand bar */}
                <div className="border-t border-zinc-150 pt-3 flex items-center justify-between text-[8px] text-zinc-400 font-mono">
                  <span>nocodestartup.io</span>
                  <span>© 2026 Open Studio</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="border-t border-zinc-205 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="bg-zinc-900 text-white font-semibold text-xs px-5 py-2 rounded-lg transition hover:bg-zinc-800"
              >
                Fechar Visualizador
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
