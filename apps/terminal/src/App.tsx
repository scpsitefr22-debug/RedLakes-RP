import { useEffect, useState } from "react";
import type { ChapterId } from "@redlakes/narrative-core";
import { hasPlayerProfile } from "@redlakes/narrative-core";
import { motion, AnimatePresence } from "framer-motion";
import { AmbientAudioProvider, useAmbientAudioContext } from "./context/AmbientAudioContext";
import { GNSProvider, useGNS } from "./context/GNSContext";
import { BootScreen } from "./components/BootScreen";
import { ProfileSelectScreen } from "./components/ProfileSelectScreen";
import { RecruitSetupScreen } from "./components/RecruitSetupScreen";
import { ChapterSelect } from "./components/ChapterSelect";
import { TerminalShell } from "./components/TerminalShell";

type AppPhase = "boot" | "profile" | "identity" | "chapters" | "terminal";

function AppFlow() {
  const { gns, createNewSaveSlot } = useGNS();
  const { setAmbientMode } = useAmbientAudioContext();
  const [phase, setPhase] = useState<AppPhase>("boot");
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  useEffect(() => {
    if (phase !== "terminal") {
      setAmbientMode("off");
    }
  }, [phase, setAmbientMode]);

  const startNewRecruit = async () => {
    await createNewSaveSlot();
    setPhase("identity");
  };

  return (
    <div className="scanlines h-screen w-screen overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <motion.div key="boot" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <BootScreen onComplete={() => setPhase("profile")} />
          </motion.div>
        )}
        {phase === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileSelectScreen
              onExistingProfile={() => setPhase("chapters")}
              onNewProfile={() => void startNewRecruit()}
            />
          </motion.div>
        )}
        {phase === "identity" && gns && (
          <motion.div
            key="identity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RecruitSetupScreen
              onComplete={() => setPhase("chapters")}
              onBack={() => setPhase("profile")}
            />
          </motion.div>
        )}
        {phase === "chapters" && gns && hasPlayerProfile(gns) && (
          <motion.div
            key="chapters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChapterSelect
              onSelect={(id) => {
                setSelectedChapter(id);
                setPhase("terminal");
              }}
              onChangeProfile={() => setPhase("profile")}
            />
          </motion.div>
        )}
        {phase === "terminal" && selectedChapter && gns && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
          >
            <TerminalShell
              chapterId={selectedChapter as ChapterId}
              onExit={() => {
                setPhase("chapters");
                setSelectedChapter(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <GNSProvider>
      <AmbientAudioProvider>
        <AppFlow />
      </AmbientAudioProvider>
    </GNSProvider>
  );
}
