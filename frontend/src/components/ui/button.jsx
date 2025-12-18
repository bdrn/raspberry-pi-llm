import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background";

const variants = {
  default: "bg-sky-600 text-white shadow hover:bg-sky-700 active:bg-sky-800",
  outline:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
};

const sizes = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-xs",
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
