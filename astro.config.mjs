import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      proxy: {
        "/api/events/operanorth": {
          target: "https://tickets.operanorth.co.uk",
          changeOrigin: true,
          rewrite: () => "/operanorth/api/v3/events",
        },
        "/api/events/bac": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/bac/api/v3/events",
        },
        "/api/events/leedsheritagetheatres": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/leedsheritagetheatres/api/v3/events",
        },
        "/api/events/wolverhamptongrand": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/wolverhamptongrand/api/v3/events",
        },
        "/api/events/pitlochryfestivaltheatre": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/pitlochryfestivaltheatre/api/v3/events",
        },
        "/api/events/bristolbeacon": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/bristolbeacon/api/v3/events",
        },
        "/api/events/mcc": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/mcc/api/v3/events",
        },
        "/api/events/minack": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/minack/api/v3/events",
        },
        "/api/events/birminghamrep": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/birminghamrep/api/v3/events",
        },
        "/api/events/bridgetheatrelondon": {
          target: "https://system.spektrix.com",
          changeOrigin: true,
          rewrite: () => "/bridgetheatrelondon/api/v3/events",
        },
      },
    },
  },
});