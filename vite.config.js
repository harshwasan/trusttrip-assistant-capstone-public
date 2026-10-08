import { defineConfig } from 'vite';
// npm run dev mounts Vite inside Express. UI and /api share the host's port.
const previewHost=process.env.APP_ORIGIN?new URL(process.env.APP_ORIGIN).hostname:null;
export default defineConfig({build:{outDir:'dist'},server:{allowedHosts:previewHost?[previewHost]:[]}});
