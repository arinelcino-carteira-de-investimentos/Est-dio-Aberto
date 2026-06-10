import { supabase } from "./supabase";

export const socialAPI = {
  dispatch: async (channels: string[], message: string) => {
    // Call the server-side API to execute posting in high-fidelity
    const res = await fetch("/api/social/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channels, message }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro de rede ao disparar publicação.");
    }
    
    const result = await res.json();
    return {
      data: {
        results: channels.map(ch => ({
          channel: ch,
          success: result.success
        }))
      }
    };
  }
};
