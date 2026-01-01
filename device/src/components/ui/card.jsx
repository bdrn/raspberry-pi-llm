import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-slate-900/80 shadow-[0_18px_45px_rgba(0,0,0,0.75)] backdrop-blur-sm",
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
        "text-base font-medium leading-tight text-slate-50",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-xs text-slate-400 leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={cn("px-5 pb-5 pt-1 text-sm text-slate-200", className)}
      {...props}
    />
  );
}
