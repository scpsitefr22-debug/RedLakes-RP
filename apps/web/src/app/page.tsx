import { HeroBanner } from "@/components/home/HeroBanner";
import { ComingSoonSection } from "@/components/home/ComingSoonSection";
import { ConceptSection } from "@/components/home/ConceptSection";
import { NewsSection } from "@/components/home/NewsSection";
import { TransmissionsPreview } from "@/components/home/TransmissionsPreview";
import { TimelinePreview } from "@/components/home/TimelinePreview";
import { SCPPreview } from "@/components/home/SCPPreview";
import { FactionsPreview } from "@/components/home/FactionsPreview";
import { QuickAccess } from "@/components/home/QuickAccess";
import { RecrutementSection } from "@/components/home/RecrutementSection";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <div id="ouverture">
        <ComingSoonSection />
      </div>
      <ConceptSection />
      <NewsSection />
      <TransmissionsPreview />
      <TimelinePreview />
      <SCPPreview />
      <FactionsPreview />
      <RecrutementSection />
      <QuickAccess />
    </>
  );
}
