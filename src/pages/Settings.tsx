import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Palette, Database, Power } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useAccent,
  accentMap,
  type AccentColor,
} from "@/contexts/AccentContext";
import { seedSampleData, clearSampleData } from "@/lib/dev";
import {
  isAutostartEnabled,
  enableAutostart,
  disableAutostart,
} from "@/lib/autostart";

const accentOptions: { key: AccentColor; label: string }[] = [
  { key: "violet", label: "Violeta" },
  { key: "cyan", label: "Ciano" },
  { key: "rose", label: "Rosa" },
  { key: "amber", label: "Âmbar" },
  { key: "emerald", label: "Esmeralda" },
  { key: "blue", label: "Azul" },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const [devLoading, setDevLoading] = useState(false);
  const [devMessage, setDevMessage] = useState<string | null>(null);
  const [autostart, setAutostart] = useState(false);
  const [autostartLoading, setAutostartLoading] = useState(false);
  const [autostartError, setAutostartError] = useState<string | null>(null);

  useEffect(() => {
    isAutostartEnabled()
      .then(setAutostart)
      .catch((e) => setAutostartError(String(e)));
  }, []);

  async function handleAutostartChange(checked: boolean) {
    setAutostartLoading(true);
    setAutostartError(null);
    try {
      if (checked) {
        await enableAutostart();
      } else {
        await disableAutostart();
      }
      setAutostart(checked);
    } catch (e) {
      setAutostartError(String(e));
    } finally {
      setAutostartLoading(false);
    }
  }

  async function handleSeed() {
    setDevLoading(true);
    setDevMessage(null);
    try {
      const msg = await seedSampleData();
      setDevMessage(msg);
    } catch (e) {
      setDevMessage(String(e));
    } finally {
      setDevLoading(false);
    }
  }

  async function handleClear() {
    setDevLoading(true);
    setDevMessage(null);
    try {
      const msg = await clearSampleData();
      setDevMessage(msg);
    } catch (e) {
      setDevMessage(String(e));
    } finally {
      setDevLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personalize a aparência do Spatium
          </p>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Theme */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Palette size={16} className="text-primary" />
                Tema
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <Label className="text-sm text-muted-foreground mb-4 block">
                Selecione o tema do aplicativo
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                    theme === "light"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      theme === "light"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Sun size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Claro</p>
                  </div>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                    theme === "dark"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      theme === "dark"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Moon size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      Escuro
                    </p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Accent Color */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Palette size={16} className="text-primary" />
                Cor Principal
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <Label className="text-sm text-muted-foreground mb-4 block">
                Escolha a cor de destaque do aplicativo
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {accentOptions.map(({ key, label }) => {
                  const { h, s, l } = accentMap[key];
                  const color = `hsl(${h}, ${s}%, ${l}%)`;
                  const isSelected = accent === key;

                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setAccent(key)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30",
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full shrink-0 transition-transform",
                              isSelected &&
                                "scale-110 ring-2 ring-offset-2 ring-offset-background ring-foreground/20",
                            )}
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-foreground overflow-hidden">
                            {label}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Autostart */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Power size={16} className="text-primary" />
                Iniciar com o Windows
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm text-foreground block">
                    Abrir o Spatium automaticamente ao ligar o computador
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Necessário para que os atalhos globais funcionem mesmo sem abrir o app manualmente. O app inicia minimizado na bandeja.
                  </p>
                </div>
                <Switch
                  checked={autostart}
                  disabled={autostartLoading}
                  onCheckedChange={handleAutostartChange}
                />
              </div>
              {autostartError && (
                <p className="text-xs text-destructive mt-3">{autostartError}</p>
              )}
            </CardContent>
          </Card>

          {/* Dev Tools — visible only in development builds */}
          {import.meta.env.DEV && (
            <Card className="border-dashed border-amber-500/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Database size={16} className="text-amber-500" />
                  Ferramentas de Desenvolvimento
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-6 space-y-4">
                <Label className="text-sm text-muted-foreground block">
                  Gere ~90 sessões de exemplo espalhadas pelos últimos 30 dias para testar o dashboard e o histórico.
                </Label>
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={handleSeed} disabled={devLoading} size="sm">
                    {devLoading ? "Aguarde..." : "Gerar dados de exemplo"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    disabled={devLoading}
                    size="sm"
                  >
                    {devLoading ? "Aguarde..." : "Limpar todas as sessões"}
                  </Button>
                </div>
                {devMessage && (
                  <p className="text-xs text-muted-foreground">{devMessage}</p>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
  );
};

export default Settings;
