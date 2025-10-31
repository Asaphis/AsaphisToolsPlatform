import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: "up" | "down";
  testId?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor, 
  iconBg,
  trend = "up",
  testId 
}: StatCardProps) {
  return (
    <Card className="p-6 hover-elevate" data-testid={testId}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-semibold text-foreground mb-2" data-testid={`${testId}-value`}>{value}</h3>
          <p className={`text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`} data-testid={`${testId}-change`}>
            {change}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}