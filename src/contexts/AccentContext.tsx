import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AccentColor = 'violet' | 'cyan' | 'rose' | 'amber' | 'emerald' | 'blue';

interface AccentColors {
  h: number;
  s: number;
  l: number;
}

const accentMap: Record<AccentColor, AccentColors> = {
  violet: { h: 263, s: 70, l: 60 },
  cyan: { h: 188, s: 85, l: 45 },
  rose: { h: 340, s: 80, l: 58 },
  amber: { h: 35, s: 90, l: 52 },
  emerald: { h: 158, s: 65, l: 45 },
  blue: { h: 217, s: 80, l: 58 },
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
    return (localStorage.getItem('spatium-accent') as AccentColor) || 'violet';
  });

  const setAccent = (a: AccentColor) => {
    setAccentState(a);
    localStorage.setItem('spatium-accent', a);
  };

  useEffect(() => {
    const { h, s, l } = accentMap[accent];
    const root = document.documentElement;
    root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    root.style.setProperty('--ring', `${h} ${s}% ${l}%`);
    root.style.setProperty('--sidebar-primary', `${h} ${s}% ${l}%`);
    root.style.setProperty('--sidebar-ring', `${h} ${s}% ${l}%`);
    root.style.setProperty('--accent', `${h} ${s}% 20%`);
    root.style.setProperty('--accent-foreground', `${h} ${s - 10}% ${l + 20}%`);
  }, [accent]);

  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  return useContext(AccentContext);
}

export { accentMap };
