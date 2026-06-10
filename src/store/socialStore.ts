import { create } from "zustand";

export interface SocialConnection {
  channel: string;
  username: string;
  token: string;
  connectedAt: string;
  apiUrl?: string;
  appId?: string;
  clientSecret?: string;
}

interface SocialStore {
  socialConnections: SocialConnection[];
  connections: Record<string, any>;
  addConnection: (platformOrConn: any, maybeCreds?: any) => void;
  removeConnection: (channel: string) => void;
  clearConnections: () => void;
}

// Initial state loaded from localStorage for persistence
const getInitialConnections = (): SocialConnection[] => {
  try {
    const raw = localStorage.getItem("open_studio_social_connections");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load social connections", e);
    return [];
  }
};

const getInitialApiKeys = (): Record<string, any> => {
  try {
    const raw = localStorage.getItem("open_studio_social_api_keys");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load social API keys", e);
    return {};
  }
};

export const useSocialStore = create<SocialStore>((set) => ({
  socialConnections: getInitialConnections(),
  connections: getInitialApiKeys(),
  
  addConnection: (platformOrConn, maybeCreds) => set((state) => {
    if (typeof platformOrConn === "string") {
      // Key manager format
      const platform = platformOrConn;
      const creds = maybeCreds || {};
      const updatedKeys = { ...state.connections, [platform]: creds };
      localStorage.setItem("open_studio_social_api_keys", JSON.stringify(updatedKeys));
      
      // Mirror to socialConnections list as well to keep the UI in sync
      const connItem: SocialConnection = {
        channel: platform,
        username: creds.username || "conectado_api",
        token: creds.token || creds.apiKey || "••••••••••••••••",
        connectedAt: new Date().toLocaleDateString("pt-BR")
      };
      const filtered = state.socialConnections.filter(
        (c) => c.channel.toLowerCase() !== platform.toLowerCase()
      );
      const updatedConns = [...filtered, connItem];
      localStorage.setItem("open_studio_social_connections", JSON.stringify(updatedConns));
      
      return { 
        connections: updatedKeys,
        socialConnections: updatedConns
      };
    } else {
      // Classic connection format
      const conn = platformOrConn;
      const filtered = state.socialConnections.filter(
        (c) => c.channel.toLowerCase() !== conn.channel.toLowerCase()
      );
      const updated = [...filtered, conn];
      localStorage.setItem("open_studio_social_connections", JSON.stringify(updated));
      return { socialConnections: updated };
    }
  }),
  
  removeConnection: (channel) => set((state) => {
    const updated = state.socialConnections.filter(
      (c) => c.channel.toLowerCase() !== channel.toLowerCase()
    );
    localStorage.setItem("open_studio_social_connections", JSON.stringify(updated));
    
    // Also remove from connections object
    const updatedKeys = { ...state.connections };
    delete updatedKeys[channel];
    localStorage.setItem("open_studio_social_api_keys", JSON.stringify(updatedKeys));
    
    return { 
      socialConnections: updated,
      connections: updatedKeys
    };
  }),
  
  clearConnections: () => set(() => {
    localStorage.removeItem("open_studio_social_connections");
    localStorage.removeItem("open_studio_social_api_keys");
    return { socialConnections: [], connections: {} };
  }),
}));
