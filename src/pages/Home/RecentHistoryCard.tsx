import type { SessionListItem } from "@/lib/dashboard";
import { formatSecondsShort, formatSessionWhen, sessionTitle } from "@/lib/format";

interface RecentHistoryCardProps {
  sessions: SessionListItem[];
  totalSeconds: number;
  isLoading: boolean;
  error: string | null;
}

export const RecentHistoryCard = ({
  sessions,
  totalSeconds,
  isLoading,
  error,
}: RecentHistoryCardProps) => (
  <div className="card">
    <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
      <h2 className="h h2">Histórico Recente</h2>
      <span className="chip">Total {formatSecondsShort(totalSeconds)}</span>
    </div>

    {isLoading ? (
      <p className="mut text-center py-12 m-0">Carregando histórico...</p>
    ) : error ? (
      <p className="text-center py-12 m-0" style={{ color: "var(--danger)" }}>{error}</p>
    ) : sessions.length === 0 ? (
      <p className="mut text-center py-12 m-0">Nenhuma entrada de tempo registrada</p>
    ) : (
      <div className="list">
        {sessions.map((s) => (
          <div key={s.id} className="item">
            <span className="dot" style={{ background: s.category_color, width: 14, height: 14 }} />
            <div className="grow">
              <div className="t">{sessionTitle(s.description)}</div>
              <div className="s">
                {s.category} · {formatSessionWhen(s.created_at)}
              </div>
            </div>
            <b className="whitespace-nowrap">{formatSecondsShort(s.duration_secs)}</b>
          </div>
        ))}
      </div>
    )}
  </div>
);
