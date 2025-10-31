"use client";

import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  // Keep the API minimal — visual styling is driven by passed className so callers can
  // use design tokens (bg-card, bg-muted, border-border, text-foreground, etc.).
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  // Provide a small lightweight default for outline variant so existing callers without
  // classes still look reasonable.
  const variantClasses =
    variant === "outline"
      ? "bg-transparent border border-border text-foreground"
      : "";

  return (
    <span className={`${base} ${variantClasses} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
