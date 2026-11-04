import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CategoryChip } from "@/components/timer/CategoryChip";
import { useTimer } from "@/hooks/useTimer";
import { useSession } from "@/contexts/SessionContext";
import { formatDuration } from "@/lib/timer";

export const QuickStartCard = () => {
  const navigate = useNavigate();
  const timer = useTimer();
  const { selectedCategory } = useSession();

  return (
    <div className="card alt" style={{ display: "flex", flexDirection: "column", gap: 18, justifyContent: "space-between" }}>
      <div>
        <div className="eyebrow">Início Rápido</div>
        <div
          className="h tabular"
          style={{ fontSize: "clamp(44px, 7vw, 60px)", marginTop: 14, letterSpacing: "-0.04em" }}
        >
          {formatDuration(timer.elapsedTime)}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <CategoryChip category={selectedCategory} />
        </div>
      </div>
      <button type="button" className="btn" onClick={() => navigate("/timer")}>
        Abrir Timer
        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
};
