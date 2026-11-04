import { Maximize2 } from "lucide-react";
import { TimerOrb } from "@/components/timer/TimerOrb";
import { TimerControls } from "@/components/timer/TimerControls";
import { CategoryChip } from "@/components/timer/CategoryChip";
import { CategorySelector } from "@/components/timer/CategorySelector";
import { useTimer } from "@/hooks/useTimer";
import { useSession } from "@/contexts/SessionContext";

interface MiniModeProps {
  onExpand: () => void;
}

/** Janela compacta com o timer, os controles e a troca rápida de categoria. */
export function MiniMode({ onExpand }: MiniModeProps) {
  const timer = useTimer();
  const session = useSession();

  return (
    <div className="minihost">
      <div className="minicard">
        <div className="row" style={{ width: "100%", justifyContent: "space-between", flexWrap: "nowrap" }}>
          <CategoryChip category={session.selectedCategory} />
          <button type="button" className="mini-ic" aria-label="Expandir janela" onClick={onExpand}>
            <Maximize2 strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        <TimerOrb variant="mini" style={{ width: 200, height: 200 }} />

        <TimerControls
          compact
          isRunning={timer.isRunning}
          onToggle={session.toggleTimer}
          onReset={session.finishSession}
          onStop={session.finishSession}
        />

        <CategorySelector
          compact
          categories={session.categories}
          selectedCategory={session.selectedCategory}
          onCategoryChange={session.selectCategory}
        />
      </div>
    </div>
  );
}
