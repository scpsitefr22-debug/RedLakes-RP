"use client";

import { useCoreShell } from "./CoreShellProvider";
import { CoreWindow } from "./CoreWindow";

export function CoreWindowLayer() {
  const { windows, order } = useCoreShell();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {windows.map((win) => {
        const stackIndex = order.indexOf(win.appId);
        const focused = win.appId === order[order.length - 1];
        return <CoreWindow key={win.appId} win={win} zIndex={10 + stackIndex} focused={focused} />;
      })}
    </div>
  );
}
