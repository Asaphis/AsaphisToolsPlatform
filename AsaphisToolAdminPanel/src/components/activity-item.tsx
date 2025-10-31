import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
}

export function ActivityItem({ icon: Icon, iconColor, iconBg, title, subtitle, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-border last:border-0 hover-elevate px-2 -mx-2 rounded-md">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
    </div>
  );
}