import { 
  LayoutDashboard, 
  Linkedin, 
  Youtube, 
  Instagram, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Workflow, 
  PenTool, 
  Palette, 
  UserCheck,
  Radar,
  Facebook,
  Globe,
  LogOut,
  Link2,
  Sparkles
} from "lucide-react";
import { Profile } from "../types";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeChannel: string;
  setActiveChannel: (channel: string) => void;
  profile: Profile;
  onLogout?: () => void;
}

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95.84 2.19 1.4 3.48 1.62V9.7c-1.39-.17-2.73-.75-3.82-1.63-.09-.07-.15-.19-.18-.3-.02 1.49-.01 2.99-.02 4.48-.06 2.05-.62 4.12-1.8 5.75-1.52 2.21-4.04 3.65-6.73 3.84-2.58.26-5.28-.6-7.14-2.42C-.17 17.51-1.07 14.15-.4 10.97c.52-2.77 2.45-5.22 5.09-6.32 1.42-.64 2.99-.9 4.54-.79V7.8c-1.12-.17-2.29-.02-3.32.48-1.54.71-2.61 2.24-2.8 3.92-.3 2.13.78 4.31 2.69 5.3 1.54.89 3.49.91 5.04.09.91-.45 1.63-1.22 1.96-2.15.22-.52.28-1.1.28-1.66V0h.03z"/>
  </svg>
);

export default function Sidebar({ activeTab, setActiveTab, activeChannel, setActiveChannel, profile, onLogout }: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    LinkedIn: true,
    YouTube: false,
    Instagram: true,
    TikTok: true,
    Facebook: false,
    Outros: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const navClass = (tabId: string, channelId?: string) => {
    const isSelected = channelId 
      ? activeTab === tabId && activeChannel === channelId
      : activeTab === tabId;
      
    return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isSelected 
        ? "bg-zinc-800 text-white shadow-sm font-semibold" 
        : "text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-200"
    }`;
  };

  const channels = [
    {
      id: "LinkedIn",
      name: "LinkedIn",
      icon: <Linkedin className="w-4 h-4 text-[#0A66C2]" />,
    },
    {
      id: "Instagram",
      name: "Instagram",
      icon: <Instagram className="w-4 h-4 text-[#E1306C]" />,
    },
    {
      id: "Facebook",
      name: "Facebook",
      icon: <Facebook className="w-4 h-4 text-[#1877F2]" />,
    },
    {
      id: "TikTok",
      name: "TikTok",
      icon: <TiktokIcon className="w-4 h-4 text-zinc-100" />,
    },
    {
      id: "YouTube",
      name: "YouTube",
      icon: <Youtube className="w-4 h-4 text-[#FF0000]" />,
    },
    {
      id: "Outros",
      name: "Outros",
      icon: <Globe className="w-4 h-4 text-emerald-500" />,
    }
  ];

  return (
    <aside className="w-68 bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen text-zinc-300 overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-905 flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          {/* Custom White Half-Moon/Circle Logo */}
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-3.5 h-7 bg-zinc-950 rounded-r-none rounded-l-full"></div>
          </div>
          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            Open Studio
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
          NOCODE STARTUP
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full ${navClass("dashboard")}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab("radar-ia")}
            className={`w-full ${navClass("radar-ia")}`}
          >
            <Radar className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="flex-1 text-left">Radar de Tendências</span>
            <span className="text-[9px] bg-rose-950/40 text-rose-300 px-1 py-0.5 border border-rose-900/30 rounded uppercase font-semibold tracking-wider scale-90">
              IA
            </span>
          </button>
        </div>

        {/* CANAIS section */}
        <div className="space-y-2">
          <span className="px-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
            CANAIS
          </span>
          
          <div className="space-y-1.5">
            {channels.map((ch) => {
              const isOpen = openSections[ch.id];
              const isSelected = activeChannel === ch.id && activeTab !== "dashboard" && activeTab !== "config";
              
              return (
                <div key={ch.id} className="space-y-0.5">
                  <button
                    onClick={() => {
                      toggleSection(ch.id);
                      setActiveChannel(ch.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-zinc-900 text-white font-semibold"
                        : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {ch.icon}
                      <span>{ch.name}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pl-6 space-y-0.5 mt-0.5 border-l border-zinc-900/80 ml-5 animate-fade-in text-left">
                      <button
                        onClick={() => {
                          setActiveChannel(ch.id);
                          setActiveTab("campaigns");
                        }}
                        className={`w-full text-left ${navClass("campaigns", ch.id)} py-1.5`}
                      >
                        <Workflow className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Campanhas</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveChannel(ch.id);
                          setActiveTab("posts");
                        }}
                        className={`w-full text-left ${navClass("posts", ch.id)} py-1.5`}
                      >
                        <PenTool className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Geração de Posts</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveChannel(ch.id);
                          setActiveTab("images");
                        }}
                        className={`w-full text-left ${navClass("images", ch.id)} py-1.5`}
                      >
                        <Palette className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Geração de Imagens</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveChannel(ch.id);
                          setActiveTab("leads");
                        }}
                        className={`w-full text-left ${navClass("leads", ch.id)} py-1.5`}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Leads</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SYSTEM section */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
            SISTEMA
          </span>
          <button
            onClick={() => setActiveTab("social-connections")}
            className={`w-full ${navClass("social-connections")}`}
          >
            <Link2 className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 text-left">Canais Conectados</span>
          </button>

          <button
            onClick={() => setActiveTab("channel-test")}
            className={`w-full ${navClass("channel-test")}`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="flex-1 text-left">Testar Canais</span>
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={`w-full ${navClass("config")}`}
          >
            <Settings className="w-4 h-4" />
            <span className="flex-1 text-left">Configurações</span>
            <span className="text-[9px] bg-red-950/40 text-red-400 px-1.5 py-0.5 border border-red-900/30 rounded uppercase font-semibold tracking-wider scale-90">
              F4
            </span>
          </button>
        </div>
      </nav>

      {/* User profile footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative shrink-0">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-10 h-10 rounded-full object-cover border border-zinc-800"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-950"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-zinc-200 truncate block">
                {profile.name.split(" ")[0]}
              </span>
              <span className="text-[8px] tracking-wide bg-gradient-to-r from-red-600 to-red-700 text-white font-mono font-bold px-1 rounded-sm scale-90">
                ADMIN
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 truncate block">
              {profile.email}
            </span>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            type="button"
            title="Sair do ERP / Fazer Logout"
            className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
