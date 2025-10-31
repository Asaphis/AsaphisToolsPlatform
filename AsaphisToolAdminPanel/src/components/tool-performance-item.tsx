import { Progress } from "@/components/ui/progress";

interface ToolPerformanceItemProps {
  name: string;
  usage: number;
  change: string;
  trend?: "up" | "down";
}

export function ToolPerformanceItem({ name, usage, change, trend = "up" }: ToolPerformanceItemProps) {
  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {change}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Progress value={usage} className="flex-1 h-2" />
        <span className="text-xs text-muted-foreground w-16 text-right">{usage.toLocaleString()} uses</span>
      </div>
    </div>
  );
}