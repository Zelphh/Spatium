import { useTheme } from "next-themes";
import { useEffect, type ReactNode } from "react";
import { Toaster as Sonner, toast } from "sonner";
import { listen } from "@tauri-apps/api/event";

type NotificationManagerProps = React.ComponentProps<typeof Sonner>;

export type NotificationOptions = {
  message: ReactNode;
  title?: ReactNode;
  borderColor?: string;
  duration?: number;
};

const DEFAULT_DURATION = 4000;
const DEFAULT_BORDER_COLOR = "var(--ac)";

export function notify({
  message,
  title,
  borderColor = DEFAULT_BORDER_COLOR,
  duration = DEFAULT_DURATION,
}: NotificationOptions) {
  return toast(title ?? message, {
    description: title ? message : undefined,
    duration,
    unstyled: true,
    className: "sp-toast",
    icon: <span className="dot" style={{ background: borderColor, width: 12, height: 12 }} />,
  });
}

const NotificationManager = ({ ...props }: NotificationManagerProps) => {
  const { theme = "system" } = useTheme();

  useEffect(() => {
    const unlistenStarted = listen("timer-session-started", () => {
      notify({ message: "Timer iniciado pelo atalho global" });
    });
    const unlistenFinished = listen("timer-session-finished", () => {
      notify({ message: "Timer finalizado pelo atalho global" });
    });

    return () => {
      void unlistenStarted.then((f) => f());
      void unlistenFinished.then((f) => f());
    };
  }, []);

  return (
    <Sonner
      theme={theme as NotificationManagerProps["theme"]}
      position="bottom-center"
      className="notification-manager"
      {...props}
    />
  );
};

export default NotificationManager;
