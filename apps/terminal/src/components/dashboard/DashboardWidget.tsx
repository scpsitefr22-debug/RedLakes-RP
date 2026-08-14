import type { ReactNode } from "react";

interface DashboardWidgetProps {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noChrome?: boolean;
}

export function DashboardWidget({
  title,
  children,
  className = "",
  bodyClassName = "",
  noChrome = false,
}: DashboardWidgetProps) {
  if (noChrome) {
    return (
      <div className={`dashboard-widget flex min-h-0 flex-col overflow-hidden ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`dashboard-widget flex min-h-0 flex-col overflow-hidden ${className}`}>
      <div className="dashboard-widget-titlebar flex shrink-0 items-center justify-between border-b border-dashboard-border/80 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-dashboard-accent">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm border border-dashboard-border bg-dashboard-panel" />
          <span className="h-2 w-2 rounded-sm border border-dashboard-border bg-dashboard-panel" />
          <span className="h-2 w-2 rounded-sm bg-red-500/90" />
        </div>
      </div>
      <div className={`min-h-0 flex-1 overflow-hidden ${bodyClassName}`}>{children}</div>
    </div>
  );
}
