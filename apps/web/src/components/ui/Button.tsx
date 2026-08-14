import { cn } from "@/lib/utils";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  href,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all",
    variant === "primary" &&
      "border border-redlake bg-redlake/20 text-white hover:bg-redlake/40 pulse-glow",
    variant === "secondary" &&
      "border border-metal bg-metal/20 text-gray-300 hover:border-redlake hover:text-white",
    variant === "ghost" && "text-gray-400 hover:text-redlake-glow",
    className
  );

  if (href) {
    if (href.startsWith("http")) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
