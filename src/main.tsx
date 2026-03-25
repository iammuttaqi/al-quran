import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// Register service worker
registerSW({ immediate: true });

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);
