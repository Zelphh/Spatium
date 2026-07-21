import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { AccentProvider } from "@/contexts/AccentContext";
import App from "./App.tsx";
import QuickStartPopup from "./pages/QuickStartPopup";
import "./index.css";

const isQuickStartPopup =
  new URLSearchParams(window.location.search).get("window") === "quick-start-popup";

createRoot(document.getElementById("root")!).render(
  isQuickStartPopup ? (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AccentProvider>
        <QuickStartPopup />
      </AccentProvider>
    </ThemeProvider>
  ) : (
    <App />
  ),
);
