import { ReactNode, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

import { useMedia } from "@/hooks/useMedia";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isSmallScreen = useMedia("(max-width: 1024px)");

  useEffect(() => {
    setSidebarOpen(!isSmallScreen);
  }, [isSmallScreen]);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      {!sidebarOpen && (
        <aside
          className={cn(
            "fixed left-0 top-0 h-full w-5 bg-card border-r border-border flex flex-col z-50 shadow-sm duration-200",
          )}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="fixed top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Menu size={18} />
          </button>
        </aside>
      )}

      <main
        className={cn(
          "flex-1 min-h-screen overflow-y-auto transition-[margin] duration-200",
          sidebarOpen ? "ml-64" : "ml-7",
        )}
      >
        {children}
      </main>
    </div>
  );
}
