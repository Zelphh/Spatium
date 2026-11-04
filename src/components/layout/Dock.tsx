import { memo } from "react";
import { Home, Timer, History, BarChart3, SlidersHorizontal, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { BrandMark } from "@/components/brand/BrandMark";
import { cn } from "@/lib/utils";

interface DockProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/timer", label: "Timer", icon: Timer },
  { path: "/history", label: "Histórico", icon: History },
  { path: "/stats", label: "Estatísticas", icon: BarChart3 },
  { path: "/settings", label: "Configurações", icon: SlidersHorizontal },
];

export const Dock = memo(function Dock({ isOpen, setIsOpen }: DockProps) {
  const toggleLabel = isOpen ? "Fechar menu" : "Abrir menu";

  return (
    <nav className={cn("dock", isOpen && "open")} aria-label="Navegação principal">
      <div className="brand">
        <BrandMark />
        <b className="lbl">Spatium</b>
      </div>

      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink key={path} to={path} end className="nav" activeClassName="on" aria-label={label}>
          <Icon strokeWidth={1.8} aria-hidden="true" />
          <span className="lbl">{label}</span>
        </NavLink>
      ))}

      <button
        type="button"
        className="nav toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={toggleLabel}
        style={{ marginTop: 8 }}
      >
        <Menu strokeWidth={1.8} aria-hidden="true" />
        <span className="lbl">{toggleLabel}</span>
      </button>
    </nav>
  );
});
