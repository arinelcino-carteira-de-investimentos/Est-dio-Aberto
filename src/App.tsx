import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import CampaignsView from "./components/CampaignsView";
import PostsView from "./components/PostsView";
import ImagesView from "./components/ImagesView";
import LeadsView from "./components/LeadsView";
import ConfigView from "./components/ConfigView";
import RadarView from "./components/RadarView";
import LoginScreen from "./components/LoginScreen";
import SocialConnectionsView from "./components/SocialConnectionsView";
import ChannelTestView from "./components/ChannelTestView";
import { AppState } from "./types";
import { RefreshCw, LayoutDashboard } from "lucide-react";
import ThemeSelectorDialog from "./components/ThemeSelectorDialog";
import { getThemeStyles } from "./themeUtils";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeChannel, setActiveChannel] = useState<string>("LinkedIn");
  const [fullscreenMode, setFullscreenMode] = useState<boolean>(false);
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [prefilledPost, setPrefilledPost] = useState<{ topic: string; keyword: string } | null>(null);
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState<boolean>(false);

  // Initial load
  const loadState = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Falha ao carregar estado do Open Studio.");
      const data = await res.json();
      setState(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro na conexão com o servidor local.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      loadState();
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth Event:", event, session);
      if (session?.user) {
        try {
          const email = session.user.email || "";
          const username = session.user.user_metadata?.username || email.split("@")[0];
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const lastLoginAt = new Date().toISOString();

          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, timezone, lastLoginAt }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setState(data);
              setLoading(false);
            }
          }
        } catch (err) {
          console.error("Failed to sync Supabase auth session", err);
          loadState();
        }
      } else if (event === "SIGNED_OUT") {
        try {
          const res = await fetch("/api/auth/logout", { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setState(prev => prev ? {
                ...prev,
                authSession: { isLoggedIn: false, username: "", email: "" }
              } : null);
            }
          }
        } catch (err) {
          console.error("Failed to log out cleanly on state change", err);
        }
        setLoading(false);
      } else {
        loadState();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Keyboard Shortcuts for ERP Operational Efficiency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is currently typing in field outputs
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      if (e.key === "F2") {
        e.preventDefault();
        setActiveTab("dashboard");
      } else if (e.key === "F4") {
        e.preventDefault();
        setActiveTab("config");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Central State Mutators

  const handleSync = async () => {
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error("Erro na sincronização de background.");
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          campaigns: data.campaigns,
          leads: data.leads,
          profile: data.profile,
          activityLogs: data.activityLogs
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCampaign = async (newCampPayload: any) => {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro no servidor ao criar robô.");
    
    // Refresh to ensure absolute synchronicity with database
    await loadState();
  };

  const handleToggleCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}/toggle`, { method: "POST" });
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          campaigns: data.campaigns,
          profile: {
            ...state.profile,
            activeCampaignsCount: data.activeCampaignsCount,
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}/delete`, { method: "POST" });
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          campaigns: data.campaigns,
          profile: {
            ...state.profile,
            activeCampaignsCount: data.activeCampaignsCount,
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPost = async (newPostPayload: any) => {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPostPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao salvar post.");
    
    await loadState();
  };

  const handleUpdatePostStatus = async (id: string, status: "Draft" | "Agendado" | "Publicado", scheduledDate?: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, scheduledDate }),
      });
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          posts: data.posts,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLead = async (newLeadPayload: any) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLeadPayload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao registrar lead.");
    
    await loadState();
  };

  const handleUpdateLeadStatus = async (id: string, status: "Novo" | "Contactado" | "Convertido") => {
    try {
      const res = await fetch(`/api/leads/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          leads: data.leads,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (profilePayload: any) => {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    });
    const data = await res.json();
    if (data.success && state) {
      setState({
        ...state,
        profile: {
          ...state.profile,
          ...data.profile,
        }
      });
    }
  };

  const handleUpdateConfig = async (configPayload: any) => {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configPayload),
    });
    const data = await res.json();
    if (data.success && state) {
      setState({
        ...state,
        config: {
          ...state.config,
          ...data.config,
        }
      });
    }
  };

  const handleAnalyzeRadar = async () => {
    const res = await fetch("/api/radar/analyze", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao realizar análise de tendências.");
    if (data.success && state) {
      setState({
        ...state,
        radarAnalysis: data.radarAnalysis,
        activityLogs: data.activityLogs
      });
    }
  };

  const handleToggleTheme = async (darkMode: boolean) => {
    try {
      const res = await fetch("/api/config/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkMode }),
      });
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          darkMode: data.darkMode,
          activityLogs: data.activityLogs
        });
      }
    } catch (err) {
      console.error("Theme toggle failed:", err);
    }
  };

  const handleSelectActiveTheme = async (activeTheme: "classic" | "ch3" | "uol" | "h2" | "refined_neon" | "sales_iq" | "cyber_matrix" | "forest_harmony" | "royal_velvet" | "carbon_brutalist") => {
    try {
      const res = await fetch("/api/config/active-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeTheme }),
      });
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          activeTheme: data.activeTheme,
          activityLogs: data.activityLogs
        });
      }
    } catch (err) {
      console.error("Theme switch failed:", err);
    }
  };

  const handleModuleCleanup = async (type: string) => {
    try {
      const res = await fetch("/api/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          campaigns: data.campaigns,
          posts: data.posts,
          leads: data.leads,
          activityLogs: data.activityLogs,
          profile: data.profile,
          config: data.config,
          activeTheme: data.activeTheme,
          darkMode: data.darkMode,
        });
      }
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  };

  const handleConnectSocial = async (channel: string, username: string) => {
    const res = await fetch("/api/social/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao conectar canal.");
    if (data.success && state) {
      setState({
        ...state,
        socialLogins: data.socialLogins,
        activityLogs: data.activityLogs || state.activityLogs
      });
    }
  };

  const handleDisconnectSocial = async (channel: string) => {
    const res = await fetch("/api/social/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao desconectar canal.");
    if (data.success && state) {
      setState({
        ...state,
        socialLogins: data.socialLogins,
        activityLogs: data.activityLogs || state.activityLogs
      });
    }
  };

  const handleLogin = async (email: string, username: string, password?: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lastLoginAt = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password: password || "FallbackPass123!"
      });
      if (sbError) {
        throw new Error(`[Supabase Auth] ${sbError.message}`);
      }
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, timezone, lastLoginAt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro de autenticação.");
    if (data.success && state) {
      setState({
        ...state,
        authSession: data.authSession,
        profile: data.profile || state.profile,
        config: data.config || state.config,
        activityLogs: data.activityLogs || state.activityLogs
      });
    }
  };

  const handleSignup = async (email: string, username: string, password?: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lastLoginAt = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email,
        password: password || "FallbackPass123!",
        options: {
          data: {
            username: username
          }
        }
      });
      if (sbError) {
        throw new Error(`[Supabase Auth Signup] ${sbError.message}`);
      }
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, timezone, lastLoginAt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao realizar cadastro.");
    if (data.success && state) {
      setState({
        ...state,
        authSession: data.authSession,
        profile: data.profile || state.profile,
        config: data.config || state.config,
        activityLogs: data.activityLogs || state.activityLogs
      });
    }
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success && state) {
        setState({
          ...state,
          authSession: data.authSession,
          activityLogs: data.activityLogs || state.activityLogs
        });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSelectSuggestedTopic = (topic: string, channel: string, keyword: string) => {
    setActiveChannel(channel);
    setPrefilledPost({ topic, keyword });
    setActiveTab("posts");
  };

  // View Router routing logic
  const renderView = () => {
    if (!state) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView 
            state={state} 
            onSync={handleSync} 
            fullscreenMode={fullscreenMode} 
            setFullscreenMode={setFullscreenMode} 
          />
        );
      case "campaigns":
        return (
          <CampaignsView 
            state={state} 
            activeChannel={activeChannel}
            onAddCampaign={handleAddCampaign}
            onToggleCampaign={handleToggleCampaign}
            onDeleteCampaign={handleDeleteCampaign}
          />
        );
      case "posts":
        return (
          <PostsView 
            state={state} 
            activeChannel={activeChannel}
            onAddPost={handleAddPost} 
            onUpdatePostStatus={handleUpdatePostStatus}
            prefilledPost={prefilledPost}
            onClearPrefilled={() => setPrefilledPost(null)}
            fullscreenMode={fullscreenMode}
            setFullscreenMode={setFullscreenMode}
          />
        );
      case "radar-ia":
        return (
          <RadarView 
            state={state} 
            onAnalyzeRadar={handleAnalyzeRadar} 
            onSelectSuggestedTopic={handleSelectSuggestedTopic} 
          />
        );
      case "images":
        return <ImagesView state={state} activeChannel={activeChannel} onUpdateConfig={handleUpdateConfig} />;
      case "leads":
        return (
          <LeadsView 
            state={state} 
            activeChannel={activeChannel}
            onAddLead={handleAddLead} 
            onUpdateLeadStatus={handleUpdateLeadStatus} 
          />
        );
      case "config":
        return (
          <ConfigView 
            state={state} 
            onUpdateProfile={handleUpdateProfile} 
            onUpdateConfig={handleUpdateConfig} 
            onToggleTheme={handleToggleTheme}
            onSelectActiveTheme={handleSelectActiveTheme}
            onModuleCleanup={handleModuleCleanup}
            fullscreenMode={fullscreenMode}
            setFullscreenMode={setFullscreenMode}
            onRefreshState={loadState}
          />
        );
      case "social-connections":
        return (
          <SocialConnectionsView 
            state={state} 
            onConnect={handleConnectSocial} 
            onDisconnect={handleDisconnectSocial} 
          />
        );
      case "channel-test":
        return (
          <ChannelTestView 
            state={state} 
            onAddPost={handleAddPost} 
            onUpdatePostStatus={handleUpdatePostStatus} 
            onRefreshState={loadState}
          />
        );
      default:
        return <DashboardView state={state} onSync={handleSync} />;
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-650 gap-4 select-none">
        <RefreshCw className="w-10 h-10 animate-spin text-zinc-800" />
        <div className="space-y-1">
          <p className="text-sm font-black font-mono tracking-widest text-zinc-900">ABRINDO OPEN STUDIO...</p>
          <p className="text-xs text-zinc-450 font-medium">NoCode StartUp • Content Automation Engine</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-650 p-6 select-none">
        <div className="bg-white border border-red-200 rounded-2xl shadow-xl max-w-md p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">!</div>
          <p className="text-sm font-bold text-zinc-800">{errorMessage}</p>
          <button 
            onClick={loadState}
            className="bg-zinc-950 text-white font-semibold text-xs px-5 py-2.5 rounded-lg hover:bg-zinc-800 transition"
          >
            Tentar conectar novamente
          </button>
        </div>
      </div>
    );
  }

  if (state && !state.authSession?.isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;
  }

  const currentTheme = getThemeStyles(state?.activeTheme || "classic", state?.darkMode);

  return (
    <div className={`flex h-screen w-screen font-sans overflow-hidden select-none transition-colors duration-300 ${state?.darkMode ? "dark text-zinc-100 bg-zinc-950" : `${currentTheme.bgPage} text-zinc-800`}`}>
      {state && (
        <style>{`
          :root {
            --color-theme-primary: ${currentTheme.primary};
            --color-theme-secondary: ${currentTheme.secondary};
          }
          /* Custom overrides */
          .theme-primary-bg { background-color: ${currentTheme.primary} !important; }
          .theme-primary-text { color: ${currentTheme.primary} !important; }
          .theme-primary-border { border-color: ${currentTheme.primary} !important; }
          .theme-accent-badge { background-color: ${currentTheme.primary}15 !important; color: ${currentTheme.primary} !important; }
          .theme-sidebar-bg { background: ${currentTheme.sidebarBg} !important; }
          
          /* Custom scrollbar matching active theme color */
          ::-webkit-scrollbar-thumb {
            background-color: ${currentTheme.primary}40 !important;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background-color: ${currentTheme.primary}80 !important;
          }
        `}</style>
      )}

      {/* Fixed Left Sidebar Navigation panel */}
      {state && !fullscreenMode && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          activeChannel={activeChannel} 
          setActiveChannel={setActiveChannel} 
          profile={state.profile} 
          onLogout={handleLogout}
        />
      )}

      {/* Floating Exit Button for Fullscreen Mode */}
      {fullscreenMode && (
        <button
          type="button"
          onClick={() => setFullscreenMode(false)}
          className="fixed top-4 right-4 z-50 bg-zinc-900 hover:bg-zinc-850 active:scale-95 text-white font-mono text-[10px] font-bold px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-1.5 transition-all animate-bounce border border-zinc-700 uppercase cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Sair Sabor Escrita / Sair Tela Cheia</span>
        </button>
      )}

      {/* Main scrolling workspace area on the right */}
      <main className={`flex-1 h-full overflow-y-auto transition-all duration-300 ${fullscreenMode ? "p-6 md:p-12 w-full" : "p-8"}`}>
        <div 
          id="ExecutiveDashboard" 
          className={`mx-auto transition-all duration-550 ease-in-out transform ${
            fullscreenMode 
              ? "max-w-5xl translate-y-4 opacity-90 scale-98" 
              : "max-w-6xl translate-y-0 opacity-100 scale-100"
          }`}
        >
          {renderView()}
        </div>
      </main>

      {/* Dynamic Theme Selector Dialog */}
      {state && (
        <ThemeSelectorDialog
          isOpen={isThemeDialogOpen}
          onClose={() => setIsThemeDialogOpen(false)}
          activeThemeId={state.activeTheme || "classic"}
          onSelectTheme={(themeId) => {
            handleSelectActiveTheme(themeId);
          }}
        />
      )}
      
      {/* Floating Theme Customizer Access Button */}
      {state && !fullscreenMode && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          {/* Quick Dark Mode Switcher */}
          <button
            type="button"
            onClick={() => handleToggleTheme(!state?.darkMode)}
            title="Alternar Modo Escuro"
            className="bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-white rounded-xl p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 select-none active:scale-95 cursor-pointer flex items-center justify-center animate-fade-in"
          >
            {state?.darkMode ? (
              <svg className="w-5 h-5 text-amber-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-400 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {/* Theme Palette Customizer dialog trigger */}
          <button
            type="button"
            onClick={() => setIsThemeDialogOpen(true)}
            title="Escolher Tema Visual"
            className="theme-primary-bg text-white dark:bg-emerald-500 rounded-xl px-4 py-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wide cursor-pointer animate-fade-in"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span>Temas Rápidos</span>
          </button>
        </div>
      )}
    </div>
  );
}
