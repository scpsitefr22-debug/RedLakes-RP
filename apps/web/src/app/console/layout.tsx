import Link from "next/link";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-metal/30 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/console"
            className="font-mono text-xs tracking-widest text-redlake-glow"
          >
            REDLAKES / CONSOLE
          </Link>
          <nav className="flex gap-4 font-mono text-[10px] text-gray-600">
            <Link href="/" className="hover:text-white">
              Site public
            </Link>
            <Link href="/intranet" className="hover:text-white">
              Intranet
            </Link>
            <span className="rounded border border-yellow-400/30 px-2 py-0.5 text-yellow-400/80">
              DEV
            </span>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
