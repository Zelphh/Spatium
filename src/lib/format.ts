const pad2 = (n: number) => String(n).padStart(2, "0");

/** 95 → "1h 35min"; 40 → "40min" */
export function formatMinutes(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${pad2(minutes % 60)}min`;
  return `${minutes}min`;
}

/** Duração curta a partir de segundos; abaixo de um minuto mostra os segundos. */
export function formatSecondsShort(totalSeconds: number) {
  if (totalSeconds > 0 && totalSeconds < 60) return `${totalSeconds}s`;
  return formatMinutes(Math.floor(totalSeconds / 60));
}

/** 3.7 → "3h 42min" */
export function formatHours(hours: number) {
  return formatMinutes(hours * 60);
}

/** "dd/mm · HH:MM" (ou "dd/mm/aaaa · HH:MM" com `withYear`). */
export function formatSessionWhen(createdAt: string, withYear = false) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  const day = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    ...(withYear ? { year: "numeric" } : {}),
  });
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time}`;
}

export function sessionTitle(description?: string | null) {
  return description && description !== "-" ? description : "Sessão sem descrição";
}
