import { Play, Pause, RotateCcw, Square } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onStop: () => void;
  /** Versão compacta do modo mini: botão de encerrar redondo à esquerda. */
  compact?: boolean;
}

export function TimerControls({ isRunning, onToggle, onReset, onStop, compact }: TimerControlsProps) {
  const playLabel = isRunning ? "Pausar" : "Iniciar";
  const PlayIcon = isRunning ? Pause : Play;

  const resetButton = (
    <button type="button" className="round" aria-label="Resetar" onClick={onReset}>
      <RotateCcw className="ico" strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
  const playButton = (
    <button type="button" className="round big" aria-label={playLabel} onClick={onToggle}>
      <PlayIcon className="ico" fill="currentColor" strokeWidth={0} aria-hidden="true" />
    </button>
  );

  if (compact) {
    return (
      <div className="row" style={{ gap: 14 }}>
        <button type="button" className="round" aria-label="Encerrar sessão" onClick={onStop}>
          <Square className="ico" fill="currentColor" strokeWidth={0} aria-hidden="true" />
        </button>
        {playButton}
        {resetButton}
      </div>
    );
  }

  return (
    <div className="row" style={{ gap: 16, justifyContent: "center" }}>
      {resetButton}
      {playButton}
      <button type="button" className="btn ghost" onClick={onStop}>
        Encerrar
      </button>
    </div>
  );
}
