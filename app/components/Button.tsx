import React from "react";
import { LoaderCircle } from "lucide-react";

function Buttons({
  className,
  size,
  children,
  onClick,
  type,
  disabled,
  loading = false,
  ...props
}: {
  className?: string;
  size: "sm" | "default" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  props?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  const baseClasses =
    "relative overflow-hidden rounded-full font-medium focus:outline-none focus-visible:ring-primary bg-primary text-primary-foreground focus-visible:ring-2 hover:bg-primary/90 shadow-lg shadow-lg/25";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  const classes = `${baseClasses} ${sizeClasses[size]} ${className}`;
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      className={classes}
    >
      <span className="relative flex items-center justify-center gap-2">
        {loading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
        {children}
      </span>
    </button>
  );
}

export default Buttons;
