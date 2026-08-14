import { CHARACTERS, getPlayerDisplayName } from "@redlakes/narrative-core";
import { useGNSRequired } from "../context/GNSContext";
import { DEPARTMENTS, getCharacterDepartment, type Department } from "../lib/workstation";

export function PersonnelApp() {
  const { gns } = useGNSRequired();
  const roster = Object.values(CHARACTERS).filter((c) => c.availableFromChapter <= 1);
  const playerName = getPlayerDisplayName(gns);

  const met = roster.filter((c) => gns.characterMemory[c.id]?.met);
  const unknown = roster.filter((c) => !gns.characterMemory[c.id]?.met);

  const groupByDept = (chars: typeof roster) =>
    DEPARTMENTS.reduce(
      (acc, dept) => {
        const items = chars.filter((c) => getCharacterDepartment(c.id) === dept);
        if (items.length) acc[dept] = items;
        return acc;
      },
      {} as Partial<Record<Department, typeof roster>>
    );

  const metByDept = groupByDept(met);
  const unknownCount = unknown.length;

  const renderChar = (char: (typeof roster)[0], dimmed = false) => {
    const mem = gns.characterMemory[char.id];
    const title = gns.world.promotedCharacters[char.id] ?? char.title;
    const dead = gns.world.deadCharacters.includes(char.id);

    return (
      <div
        key={char.id}
        className={`flex items-center gap-3 border-b border-panel-border/50 px-4 py-3 ${
          dead || dimmed ? "opacity-45" : ""
        }`}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: char.avatarColor }}
        >
          {char.name.charAt(0)}
        </div>
        <div>
          <div className="text-xs text-foreground">
            {char.name} {dead && "†"}
          </div>
          <div className="text-[10px] text-metal">{title}</div>
          {mem?.met && <div className="text-[9px] text-terminal">Contact établi</div>}
          {dimmed && <div className="text-[9px] text-metal/60">Non rencontré</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-panel-border px-4 py-2 text-[10px] uppercase tracking-wider text-metal">
        Annuaire — Personnel Site-12
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-redlake/30 bg-redlake/5 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-redlake/30 text-xs font-bold text-foreground">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs text-foreground">{playerName} (vous)</div>
            <div className="text-[10px] text-metal">Recrue — Département Général</div>
            <div className="text-[10px] text-metal/60">
              {gns.player.employeeId ?? "ID en attente"} — Clearance 1
            </div>
          </div>
        </div>

        {Object.entries(metByDept).map(([dept, members]) => (
          <div key={dept}>
            <div className="sticky top-0 bg-panel px-4 py-1.5 text-[9px] font-medium uppercase tracking-wider text-metal/80">
              {dept}
            </div>
            {members!.map((c) => renderChar(c))}
          </div>
        ))}

        {met.length === 0 && (
          <p className="px-4 py-6 text-center text-[10px] text-metal">
            Aucun contact établi. Répondez aux messages pour peupler l&apos;annuaire.
          </p>
        )}

        {unknownCount > 0 && (
          <div className="border-t border-panel-border/80">
            <div className="bg-classified px-4 py-2 text-[9px] uppercase tracking-wider text-metal/70">
              Non rencontrés ({unknownCount}) — clearance 1
            </div>
            {unknown.slice(0, 4).map((c) => renderChar(c, true))}
            {unknownCount > 4 && (
              <p className="px-4 py-2 text-[9px] text-metal/50">
                + {unknownCount - 4} entrées masquées jusqu&apos;au premier contact.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
