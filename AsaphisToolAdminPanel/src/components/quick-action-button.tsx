import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  iconColor: string;
  testId?: string;
}

export function QuickActionButton({ icon: Icon, label, onClick, iconColor, testId }: QuickActionButtonProps) {
  return (
    <Button
      variant="outline"
      className="h-24 flex flex-col items-center justify-center gap-2 hover-elevate active-elevate-2"
      onClick={onClick}
      data-testid={testId}
    >
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}