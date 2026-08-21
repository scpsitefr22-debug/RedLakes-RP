import type { Command } from "./types.js";
import { hub } from "./hub.js";

export const commands: Command[] = [hub];

export const commandMap = new Map<string, Command>(
  commands.map((c) => [c.data.name, c]),
);
