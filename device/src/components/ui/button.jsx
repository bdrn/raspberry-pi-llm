import { cn } from "@/lib/utils";

const baseStyles =
  "game-button inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background";

const variants = {
  default: "game-button-primary shadow",
  outline:
    "game-button-secondary border border-[var(--theme-button-secondary-border)] shadow-sm hover:border-[var(--theme-button-secondary-border)]",
  ghost: "text-[var(--theme-text)] hover:bg-white/5",
};

const sizes = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-[11px]",
  lg: "h-10 px-6 text-sm",
  icon: "h-9 w-9",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild,
  ...props
}) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
