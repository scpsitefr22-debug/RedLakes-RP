"use client";

import { useEffect, useState } from "react";
import { CoreShell } from "@/components/core/CoreShell";
import { CoreBootSequence } from "@/components/core/CoreBootSequence";
import { useCoreShell } from "@/components/core/CoreShellProvider";

const BOOT_SEEN_KEY = "redlakes_core_boot_seen";

export default function CorePage() {
  const { session } = useCoreShell();
  const [showBoot, setShowBoot] = useState<boolean | null>(null);

  useEffect(() => {
    setShowBoot(!sessionStorage.getItem(BOOT_SEEN_KEY));
  }, []);

  const completeBoot = () => {
    sessionStorage.setItem(BOOT_SEEN_KEY, "1");
    setShowBoot(false);
  };

  if (showBoot === null) return null;

  if (showBoot) {
    return <CoreBootSequence session={session} onComplete={completeBoot} />;
  }

  return <CoreShell />;
}
