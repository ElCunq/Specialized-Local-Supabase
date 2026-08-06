import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  let variantStyles = "";
  switch (variant) {
    case "secondary":
      variantStyles = "bg-[#27272a] text-slate-300 border-transparent";
      break;
    case "destructive":
      variantStyles = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      break;
    case "outline":
      variantStyles = "border-[#27272a] text-slate-400";
      break;
    case "success":
      variantStyles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      break;
    case "default":
    default:
      variantStyles = "bg-emerald-500 text-slate-950 border-transparent font-bold";
      break;
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles} ${className}`}
      {...props}
    />
  );
}

export { Badge };
