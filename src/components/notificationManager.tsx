import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { Toaster as Sonner, toast } from "sonner";

type NotificationManagerProps = React.ComponentProps<typeof Sonner>;

export type NotificationOptions = {
  message: ReactNode;
  title?: ReactNode;
  borderColor?: string;
  duration?: number;
};

const DEFAULT_DURATION = 4000;
const DEFAULT_BORDER_COLOR = "hsl(var(--primary))";

export function notify({
  message,
  title,
  borderColor = DEFAULT_BORDER_COLOR,
  duration = DEFAULT_DURATION,
}: NotificationOptions) {
  return toast(title ?? message, {
    description: title ? message : undefined,
    duration,
    className: "w-[360px] max-w-[calc(100vw-2rem)] border-l-4",
    style: {
      borderLeftColor: borderColor,
    },
  });
}

const NotificationManager = ({ ...props }: NotificationManagerProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as NotificationManagerProps["theme"]}
      position="top-right"
      className="notification-manager group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.notification-manager]:bg-background group-[.notification-manager]:text-foreground group-[.notification-manager]:border-border group-[.notification-manager]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export default NotificationManager;
