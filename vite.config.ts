import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SPA mode for Vercel deployment (no Cloudflare Worker bundle).
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true },
    server: { entry: "server" },
  },
});
