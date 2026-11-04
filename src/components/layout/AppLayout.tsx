import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Minimize2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Dock } from "./Dock";
import { MiniMode } from "./MiniMode";
import { useMedia } from "@/hooks/useMedia";
import { enterMiniWindow, exitMiniWindow } from "@/lib/window";

export function AppLayout() {
  const [dockOpen, setDockOpen] = useState(true);
  const [mini, setMini] = useState(false);
  const isSmallScreen = useMedia("(max-width: 780px)");
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";

  useEffect(() => {
    setDockOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const goMini = () => {
    setMini(true);
    void enterMiniWindow();
  };

  const outMini = () => {
    setMini(false);
    void exitMiniWindow();
  };

  if (mini) {
    return <MiniMode onExpand={outMini} />;
  }

  return (
    <div className="shell">
      <Dock isOpen={dockOpen} setIsOpen={setDockOpen} />

      <main className="main">
        <div className="topbar">
          <button
            type="button"
            className="round"
            aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun className="ico" strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Moon className="ico" strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>
          <button type="button" className="btn ghost" onClick={goMini}>
            <Minimize2 size={18} strokeWidth={1.8} aria-hidden="true" />
            Modo mini
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
