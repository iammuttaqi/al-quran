import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// Register service worker
registerSW({ immediate: true });

const rootElement = document.getElementById("root")!;
const initialData = (window as any).__INITIAL_DATA__;

const app = (
  <StrictMode>
    <App initialData={initialData} />
    <Analytics />
  </StrictMode>
);

if (initialData) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
