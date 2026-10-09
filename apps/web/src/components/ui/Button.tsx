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
    "font-display inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold uppercase tracking-[0.12em] transition-colors",
    variant === "primary" && "bg-redlake-glow text-white hover:bg-[#ff4a3f]",
    variant === "secondary" &&
      "border border-line-strong text-gray-200 hover:border-white hover:text-white",
    variant === "ghost" && "text-gray-400 hover:text-white",
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
