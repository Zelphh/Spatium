import { useEffect, useState } from "react";
import { Sun, Moon, Minus, Plus } from "lucide-react";
import { useFocusGoal, formatGoalHours, FOCUS_GOAL_MIN, FOCUS_GOAL_MAX } from "@/hooks/useFocusGoal";
import { useTheme } from "next-themes";
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
import {
  getShortcuts,
  updateShortcut,
  type ShortcutBinding,
} from "@/lib/shortcuts";

const MODIFIER_CODES = [
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "ShiftLeft",
  "ShiftRight",
  "MetaLeft",
  "MetaRight",
];

const accentOptions = Object.keys(accentMap) as AccentColor[];

/** "CommandOrControl+Alt+KeyI" → ["Ctrl", "Alt", "I"] */
function formatShortcutKeys(keys: string) {
  return keys.split("+").map((part) => {
    if (part === "CommandOrControl" || part === "Control") return "Ctrl";
    return part.replace(/^Key([A-Z])$/, "$1").replace(/^Digit(\d)$/, "$1");
  });
}

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const { goal, setGoal } = useFocusGoal();
  const [devLoading, setDevLoading] = useState(false);
  const [devMessage, setDevMessage] = useState<string | null>(null);
  const [autostart, setAutostart] = useState(false);
  const [autostartLoading, setAutostartLoading] = useState(false);
  const [autostartError, setAutostartError] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState<ShortcutBinding[]>([]);
  const [recordingActionId, setRecordingActionId] = useState<number | null>(null);
  const [shortcutsError, setShortcutsError] = useState<string | null>(null);

  useEffect(() => {
    isAutostartEnabled()
      .then(setAutostart)
      .catch((e) => setAutostartError(String(e)));
  }, []);

  useEffect(() => {
    getShortcuts()
      .then(setShortcuts)
      .catch((e) => setShortcutsError(String(e)));
  }, []);

  useEffect(() => {
    if (recordingActionId === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault();

      if (e.code === "Escape") {
        setRecordingActionId(null);
        return;
      }
      if (MODIFIER_CODES.includes(e.code)) return;

      const mods: string[] = [];
      if (e.ctrlKey) mods.push("CommandOrControl");
      if (e.altKey) mods.push("Alt");
      if (e.shiftKey) mods.push("Shift");

      if (mods.length === 0) {
        setShortcutsError(
          "Escolha um atalho com pelo menos uma tecla modificadora (Ctrl, Alt ou Shift).",
        );
        return;
      }

      const actionId = recordingActionId;
      const keys = [...mods, e.code].join("+");
      setRecordingActionId(null);
      setShortcutsError(null);

      updateShortcut({ action_id: actionId, keys })
        .then((updated) => {
          setShortcuts((prev) =>
            prev.map((s) => (s.action_id === actionId ? updated : s)),
          );
        })
        .catch((error) => setShortcutsError(String(error)));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recordingActionId]);

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

  const isDark = theme !== "light";

  return (
    <section className="screen" aria-label="Configurações">
      <h1 className="h h1">Configurações</h1>

      <div className="card">
        <h2 className="h h2" style={{ marginBottom: 14 }}>
          Tema
        </h2>
        <div className="g3">
          <button type="button" className={cn("opt", isDark && "sel")} onClick={() => setTheme("dark")}>
            <span className="prev" style={{ background: "#16141f", color: "#f3f1f8" }}>
              <Moon className="ico" strokeWidth={1.8} aria-hidden="true" />
            </span>
            Escuro
          </button>
          <button type="button" className={cn("opt", !isDark && "sel")} onClick={() => setTheme("light")}>
            <span className="prev" style={{ background: "#f3f1ee", color: "#1d1b24", border: "1px solid rgba(0,0,0,.12)" }}>
              <Sun className="ico" strokeWidth={1.8} aria-hidden="true" />
            </span>
            Claro
          </button>
        </div>
      </div>

      <div className="card alt">
        <h2 className="h h2" style={{ marginBottom: 14 }}>
          Cor principal
        </h2>
        <div className="row" style={{ gap: 14 }} role="group" aria-label="Cor principal">
          {accentOptions.map((key) => {
            const { label, light, dark } = accentMap[key];
            const [from, to] = isDark ? dark : light;
            const isSelected = accent === key;

            return (
              <span key={key} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  className={cn("swatch", isSelected && "sel")}
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  title={label}
                  aria-label={label}
                  aria-pressed={isSelected}
                  onClick={() => setAccent(key)}
                />
                <span className="mut" style={{ fontSize: 12, fontWeight: 600 }}>
                  {label}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 className="h h2">Meta de foco diária</h2>
            <div className="mut" style={{ fontSize: 14, marginTop: 4 }}>
              Usada no anel de meta em Estatísticas
            </div>
          </div>
          <div className="stepper">
            <button
              type="button"
              className="round"
              style={{ width: 44, height: 44 }}
              aria-label="Diminuir meta"
              disabled={goal <= FOCUS_GOAL_MIN}
              onClick={() => setGoal(goal - 0.5)}
            >
              <Minus className="ico" strokeWidth={2} aria-hidden="true" />
            </button>
            <b aria-live="polite">{formatGoalHours(goal)}</b>
            <button
              type="button"
              className="round"
              style={{ width: 44, height: 44 }}
              aria-label="Aumentar meta"
              disabled={goal >= FOCUS_GOAL_MAX}
              onClick={() => setGoal(goal + 0.5)}
            >
              <Plus className="ico" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="card alt">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
          <div>
            <h2 className="h h2">Iniciar com o Windows</h2>
            <div className="mut" style={{ fontSize: 14, marginTop: 4 }}>
              Necessário para os atalhos globais funcionarem sem abrir o app. O app inicia minimizado na bandeja.
            </div>
          </div>
          <button
            type="button"
            className={cn("sw", autostart && "on")}
            role="switch"
            aria-checked={autostart}
            aria-label="Iniciar com o Windows"
            disabled={autostartLoading}
            onClick={() => handleAutostartChange(!autostart)}
          >
            <i />
          </button>
        </div>
        {autostartError && (
          <p style={{ fontSize: 13, margin: "12px 0 0", color: "var(--danger)" }}>{autostartError}</p>
        )}
      </div>

      <div className="card">
        <h2 className="h h2" style={{ marginBottom: 6 }}>
          Atalhos Globais
        </h2>
        <p className="mut" style={{ fontSize: 14, margin: "0 0 14px" }}>
          Funcionam mesmo com o Spatium minimizado na bandeja. Exige pelo menos um modificador (Ctrl, Alt ou Shift). Esc cancela.
        </p>
        <div className="list">
          {shortcuts.map((shortcut) => {
            const isRecording = recordingActionId === shortcut.action_id;
            return (
              <div key={shortcut.action_id} className="item" style={{ flexWrap: "wrap" }}>
                <div className="grow" style={{ minWidth: 200 }}>
                  <div className="t" style={{ whiteSpace: "normal" }}>
                    {shortcut.action_label}
                  </div>
                  <div className="kbd" style={{ marginTop: 6 }}>
                    {formatShortcutKeys(shortcut.keys).map((part, i) => (
                      <span key={i}>{part}</span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setShortcutsError(null);
                    setRecordingActionId(isRecording ? null : shortcut.action_id);
                  }}
                  disabled={recordingActionId !== null && !isRecording}
                >
                  {isRecording ? "Pressione as teclas…" : "Gravar novo atalho"}
                </button>
              </div>
            );
          })}
        </div>
        {shortcutsError && (
          <p style={{ fontSize: 13, margin: "12px 0 0", color: "var(--danger)" }}>{shortcutsError}</p>
        )}
      </div>

      {/* Dev Tools — visible only in development builds */}
      {import.meta.env.DEV && (
        <div className="card" style={{ borderStyle: "dashed", borderColor: "#f59e0b" }}>
          <h2 className="h h2" style={{ marginBottom: 6 }}>
            Ferramentas de Desenvolvimento
          </h2>
          <p className="mut" style={{ fontSize: 14, margin: "0 0 14px" }}>
            Gere ~90 sessões de exemplo espalhadas pelos últimos 30 dias para testar o dashboard e o histórico.
          </p>
          <div className="row">
            <button type="button" className="btn sm" onClick={handleSeed} disabled={devLoading}>
              {devLoading ? "Aguarde..." : "Gerar dados de exemplo"}
            </button>
            <button type="button" className="btn ghost sm" onClick={handleClear} disabled={devLoading}>
              {devLoading ? "Aguarde..." : "Limpar todas as sessões"}
            </button>
          </div>
          {devMessage && (
            <p className="mut" style={{ fontSize: 13, margin: "12px 0 0" }}>{devMessage}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Settings;
