import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { type SessionListItem } from "@/lib/dashboard";
import { formatDuration, getCategories } from "@/lib/timer";
import { getHistoryData } from "@/lib/history";
import { type Category } from "@/pages/type";

const formatDate = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return { date: createdAt, time: "--:--" };
  }

  return {
    date: date.toLocaleDateString("pt-BR"),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

type SortOrder = "desc" | "asc";

const History = () => {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    void Promise.all([getHistoryData(), getCategories()])
      .then(([historyResponse, cats]) => {
        if (!mounted) return;
        setSessions(historyResponse.sessions);
        setCategories(cats);
        setError(null);
      })
      .catch((fetchError) => {
        if (!mounted) return;
        setError(String(fetchError));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

  const filteredSessions = useMemo(() => {
    let list = [...sessions];

    if (startDate) {
      list = list.filter((s) => s.created_at.slice(0, 10) >= startDate);
    }
    if (endDate) {
      list = list.filter((s) => s.created_at.slice(0, 10) <= endDate);
    }
    if (selectedCategories.length > 0) {
      list = list.filter((s) => selectedCategories.includes(s.category));
    }

    list.sort((a, b) => {
      const diff =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === "desc" ? diff : -diff;
    });

    return list;
  }, [sessions, startDate, endDate, selectedCategories, sortOrder]);

  const totalSeconds = useMemo(
    () => filteredSessions.reduce((acc, s) => acc + s.duration_secs, 0),
    [filteredSessions],
  );

  const enrichedSessions = useMemo(
    () =>
      filteredSessions.map((session) => {
        const formattedDate = formatDate(session.created_at);
        return {
          ...session,
          duration: formatDuration(session.duration_secs),
          date: formattedDate.date,
          time: formattedDate.time,
        };
      }),
    [filteredSessions],
  );

  const hasDateFilter = startDate !== "" || endDate !== "";
  const hasActiveFilter =
    hasDateFilter || selectedCategories.length > 0;

  return (
    <div className="p-8 max-w-5xl w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Suas sessões de foco
        </p>
      </motion.div>

      <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Sessões</CardTitle>
          <span className="text-xs text-muted-foreground timer-display">
            Total:{" "}
            <span className="text-primary">{formatDuration(totalSeconds)}</span>
          </span>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">De</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-7 px-2 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-7 px-2 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            {hasActiveFilter && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedCategories([]);
                }}
              >
                Limpar filtros
              </Button>
            )}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg ml-auto">
              <Button
                size="sm"
                variant={sortOrder === "desc" ? "default" : "ghost"}
                className="h-8 px-4 text-xs rounded-md"
                onClick={() => setSortOrder("desc")}
              >
                Mais recente
              </Button>
              <Button
                size="sm"
                variant={sortOrder === "asc" ? "default" : "ghost"}
                className="h-8 px-4 text-xs rounded-md"
                onClick={() => setSortOrder("asc")}
              >
                Mais antigo
              </Button>
            </div>
          </div>

          {/* Category filter badges */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {categories.map((cat) => {
                const active = selectedCategories.includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.name)}
                    className="rounded-full px-3 py-0.5 text-xs font-medium transition-opacity focus:outline-none"
                    style={{
                      backgroundColor: active
                        ? `${cat.color}30`
                        : `${cat.color}12`,
                      color: cat.color,
                      outline: active ? `1.5px solid ${cat.color}60` : "none",
                      opacity: selectedCategories.length === 0 || active ? 1 : 0.45,
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              Carregando histórico...
            </p>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-16">
              {error}
            </p>
          ) : enrichedSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center py-16 gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Clock size={28} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm text-center">
                {hasActiveFilter
                  ? "Nenhuma sessão encontrada para os filtros selecionados"
                  : "Nenhuma entrada de tempo registrada"}
              </p>
              {!hasActiveFilter && (
                <p className="text-muted-foreground/60 text-xs text-center">
                  As sessões serão salvas aqui quando você completar um timer
                </p>
              )}
            </motion.div>
          ) : (
            <div className="space-y-2">
              {enrichedSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock size={17} className="text-primary" />
                    </div>
                    <div>
                      <p
                        className={`font-medium text-sm ${
                          session.description && session.description !== "-"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {session.description && session.description !== "-"
                          ? session.description
                          : "Sessão sem descrição"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-xs h-5 px-1.5 border-0"
                          style={{
                            backgroundColor: `${session.category_color}25`,
                            color: session.category_color,
                          }}
                        >
                          {session.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar size={11} />
                          <span>
                            {session.date} às {session.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="timer-display text-base font-bold text-primary shrink-0 ml-4">
                    {session.duration}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
