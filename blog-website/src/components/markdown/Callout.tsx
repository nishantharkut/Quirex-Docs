import { Info, AlertTriangle, Lightbulb, AlertCircle, StickyNote } from "lucide-react";
import { ReactNode } from "react";

const config: Record<string, { icon: ReactNode; label: string; borderClass: string; bgClass: string; iconClass: string }> = {
  info: {
    icon: <Info className="w-4 h-4" />,
    label: "Info",
    borderClass: "border-primary/30",
    bgClass: "bg-primary/[0.04]",
    iconClass: "text-primary",
  },
  tip: {
    icon: <Lightbulb className="w-4 h-4" />,
    label: "Tip",
    borderClass: "border-[hsl(142,60%,45%)]/30",
    bgClass: "bg-[hsl(142,60%,45%)]/[0.04]",
    iconClass: "text-[hsl(142,60%,45%)]",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Warning",
    borderClass: "border-[hsl(38,92%,50%)]/30",
    bgClass: "bg-[hsl(38,92%,50%)]/[0.04]",
    iconClass: "text-[hsl(38,92%,50%)]",
  },
  danger: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Danger",
    borderClass: "border-destructive/30",
    bgClass: "bg-destructive/[0.04]",
    iconClass: "text-destructive",
  },
  note: {
    icon: <StickyNote className="w-4 h-4" />,
    label: "Note",
    borderClass: "border-muted-foreground/20",
    bgClass: "bg-muted/40",
    iconClass: "text-muted-foreground",
  },
};

interface CalloutProps {
  type: string;
  title?: string;
  children: ReactNode;
}

export function Callout({ type, title, children }: CalloutProps) {
  const c = config[type] || config.note;

  return (
    <div className={`my-5 rounded-md border-l-[3px] ${c.borderClass} ${c.bgClass} px-4 py-3`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={c.iconClass}>{c.icon}</span>
        <span className="text-[13px] font-semibold text-foreground">
          {title || c.label}
        </span>
      </div>
      <div className="text-[13px] leading-relaxed text-foreground/80 [&>br]:block [&>br]:mb-1">
        {children}
      </div>
    </div>
  );
}
