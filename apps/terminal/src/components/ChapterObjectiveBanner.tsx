import type { ChapterId } from "@redlakes/narrative-core";
import { getChapterObjective } from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";

interface ChapterObjectiveBannerProps {
  chapterId: ChapterId;
}

export function ChapterObjectiveBanner({ chapterId }: ChapterObjectiveBannerProps) {
  const { gns } = useGNSRequired();
  const objective = getChapterObjective(gns, chapterId);

  if (!objective) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-20 max-w-lg -translate-x-1/2 border border-terminal/30 bg-panel/95 px-4 py-2 text-center text-[10px] text-foreground backdrop-blur-sm">
      <span className="mr-1.5 text-terminal">▸</span>
      {objective}
    </div>
  );
}
