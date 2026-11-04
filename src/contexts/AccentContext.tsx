import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AccentColor = 'violet' | 'cyan' | 'rose' | 'amber' | 'emerald' | 'blue';

interface AccentDefinition {
  label: string;
  /** Gradiente [início, fim] usado no tema claro */
  light: [string, string];
  /** Gradiente [início, fim] usado no tema escuro */
  dark: [string, string];
}

// Os valores efetivos ficam em assets/theme.css (seletores [data-accent]); este mapa serve
// para pré-visualizar as cores na tela de configurações.
const accentMap: Record<AccentColor, AccentDefinition> = {
  violet: { label: 'Violeta', light: ['#6d3fe0', '#a21caf'], dark: ['#a78bfa', '#e879f9'] },
  cyan: { label: 'Ciano', light: ['#0e7490', '#1d4ed8'], dark: ['#22d3ee', '#60a5fa'] },
  rose: { label: 'Rosa', light: ['#be185d', '#b45309'], dark: ['#f472b6', '#fbbf24'] },
  amber: { label: 'Âmbar', light: ['#b45309', '#be185d'], dark: ['#fbbf24', '#fb7185'] },
  emerald: { label: 'Esmeralda', light: ['#047857', '#0e7490'], dark: ['#34d399', '#22d3ee'] },
  blue: { label: 'Azul', light: ['#1d4ed8', '#6d3fe0'], dark: ['#60a5fa', '#a78bfa'] },
};

interface AccentContextValue {
  accent: AccentColor;
  setAccent: (a: AccentColor) => void;
}

const AccentContext = createContext<AccentContextValue>({
  accent: 'violet',
  setAccent: () => {},
});

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem('spatium-accent') as AccentColor | null;
    return stored && stored in accentMap ? stored : 'violet';
  });

  const setAccent = (a: AccentColor) => {
    setAccentState(a);
    localStorage.setItem('spatium-accent', a);
  };

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  return useContext(AccentContext);
}

export { accentMap };
