import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/lib/theme-provider";
import "./styles/globals.css";
import App from "./App.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
