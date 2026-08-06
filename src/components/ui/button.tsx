import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "emerald";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
    let baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    let variantStyles = "";
    switch (variant) {
      case "destructive":
        variantStyles = "bg-rose-600 text-white hover:bg-rose-500 shadow-sm";
        break;
      case "outline":
        variantStyles = "border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] hover:text-white text-slate-300";
        break;
      case "secondary":
        variantStyles = "bg-[#27272a] text-white hover:bg-[#3f3f46]";
        break;
      case "ghost":
        variantStyles = "hover:bg-[#27272a] text-slate-400 hover:text-white";
        break;
      case "link":
        variantStyles = "text-emerald-400 underline-offset-4 hover:underline p-0";
        break;
      case "emerald":
        variantStyles = "bg-[#10b981] text-slate-950 hover:bg-[#059669] font-bold shadow-md shadow-emerald-500/20";
        break;
      case "default":
      default:
        variantStyles = "bg-white text-slate-950 hover:bg-slate-200 font-bold shadow-sm";
        break;
    }

    let sizeStyles = "";
    switch (size) {
      case "sm":
        sizeStyles = "h-8 px-3 text-[11px]";
        break;
      case "lg":
        sizeStyles = "h-11 px-8 text-sm";
        break;
      case "icon":
        sizeStyles = "h-9 w-9 p-0";
        break;
      case "default":
      default:
        sizeStyles = "h-9 px-4 py-2";
        break;
    }

    return (
      <button
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
