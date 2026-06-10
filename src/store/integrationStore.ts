import { create } from "zustand";

export interface WebhookConfig {
  id: string;
  url: string;
  payloadFormat: "JSON" | "Form-Data";
  event: "lead_captured" | "automation_error";
  enabled: boolean;
}

interface IntegrationStore {
  webhooks: WebhookConfig[];
  addWebhook: (webhook: Omit<WebhookConfig, "id">) => void;
  removeWebhook: (id: string) => void;
  toggleWebhook: (id: string) => void;
}

const getInitialWebhooks = (): WebhookConfig[] => {
  try {
    const raw = localStorage.getItem("open_studio_webhooks");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load webhooks", e);
  }
  return [
    { id: "wh_1", url: "https://api.testpress.com/receiver/lead", payloadFormat: "JSON", event: "lead_captured", enabled: true },
    { id: "wh_2", url: "https://webhooks.site/openstudio-error", payloadFormat: "Form-Data", event: "automation_error", enabled: false }
  ];
};

export const useIntegrationStore = create<IntegrationStore>((set) => ({
  webhooks: getInitialWebhooks(),
  
  addWebhook: (webhook) => set((state) => {
    const newWebhook: WebhookConfig = {
      ...webhook,
      id: "webhook_" + Date.now()
    };
    const updated = [...state.webhooks, newWebhook];
    localStorage.setItem("open_studio_webhooks", JSON.stringify(updated));
    return { webhooks: updated };
  }),
  
  removeWebhook: (id) => set((state) => {
    const updated = state.webhooks.filter((w) => w.id !== id);
    localStorage.setItem("open_studio_webhooks", JSON.stringify(updated));
    return { webhooks: updated };
  }),
  
  toggleWebhook: (id) => set((state) => {
    const updated = state.webhooks.map((w) => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    localStorage.setItem("open_studio_webhooks", JSON.stringify(updated));
    return { webhooks: updated };
  })
}));
