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
  const isSmallScreen = useMedia("(max-width: 780px)");

  useEffect(() => {
    setSidebarOpen(!isSmallScreen);
  }, [isSmallScreen]);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      {!sidebarOpen && (
        <aside
          className={cn(
            "fixed left-0 top-0 h-full w-6 bg-card border-r border-border flex flex-col z-50 shadow-sm duration-200",
          )}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className={cn(
              "fixed top-6 z-50 inline-flex h-10 w-9 items-center justify-center rounded-md bg-card text-foreground shadow-sm transition-all",
              "border border-border border-l-0 border-t-0 border-b-0 rounded-full",
            )}
            >
            <Menu size={18} />
          </button>
        </aside>
      )}
    
      <main
        className={cn(
          "flex-1 min-h-screen overflow-y-auto transition-[margin] duration-300",
          !isSmallScreen && sidebarOpen ? "ml-60" : "ml-8",
        )}
      >
        {children}
      </main>
    </div>
  );
}
