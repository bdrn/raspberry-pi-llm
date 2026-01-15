import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <section
      className={cn(
        "game-panel rounded-2xl backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <header
      className={cn("flex flex-col gap-1 px-5 pt-5 pb-3", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        "text-base font-medium leading-tight theme-text",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-xs theme-muted leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={cn("px-5 pb-5 pt-1 text-sm theme-muted", className)}
      {...props}
    />
  );
}
