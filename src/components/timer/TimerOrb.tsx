import { useId } from "react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import type { TimerMode } from "@/pages/type";

export const MODE_LABELS: Record<TimerMode, string> = {
  standard: "Padrão",
  pomodoro: "Pomodoro",
  custom: "Personalizado",
};

const VARIANTS = {
  full: { box: 280, radius: 120, stroke: 12, timeSize: "clamp(46px, 13vw, 70px)", labelSize: 14 },
  mini: { box: 120, radius: 54, stroke: 7, timeSize: "44px", labelSize: 13 },
};

interface TimerOrbProps {
  variant?: keyof typeof VARIANTS;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Anel de progresso do timer. Nos modos com duração alvo mostra o progresso total;
 * no modo padrão o anel dá uma volta a cada minuto.
 */
export function TimerOrb({ variant = "full", className, style }: TimerOrbProps) {
  const timer = useTimer();
  const gradientId = useId();
  const { box, radius, stroke, timeSize, labelSize } = VARIANTS[variant];
  const circumference = 2 * Math.PI * radius;
  const fraction = timer.progress !== null ? timer.progress / 100 : (timer.elapsedTime % 60) / 60;
  const center = box / 2;

  return (
    <div className={cn("orb", timer.isRunning && "run", className)} style={style}>
      <div className="glow" />
      <svg viewBox={`0 0 ${box} ${box}`} style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--ac)" }} />
            <stop offset="1" style={{ stopColor: "var(--ac2)" }} />
          </linearGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(fraction * circumference).toFixed(1)} ${circumference.toFixed(1)}`}
          style={{ transition: "stroke-dasharray 1s linear" }}
        />
      </svg>
      <div className="time" role="timer" aria-live="off">
        <b style={{ fontSize: timeSize }}>{timer.formattedTime}</b>
        <span className="mut" style={{ fontSize: labelSize, fontWeight: 600 }}>
          {MODE_LABELS[timer.mode]}
        </span>
      </div>
    </div>
  );
}
