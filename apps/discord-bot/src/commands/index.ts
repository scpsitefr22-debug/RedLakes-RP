import type { Command } from "./types.js";
import { link } from "./link.js";
import { unlink } from "./unlink.js";
import { profil } from "./profil.js";
import { serveur } from "./serveur.js";
import { grades } from "./grades.js";
import { candidature } from "./candidature.js";
import { wiki } from "./wiki.js";
import { aide } from "./aide.js";
import { ping } from "./ping.js";

import { syncRoles, syncRolesAdmin } from "./sync-roles.js";
import { rolesAdmin } from "./roles-admin.js";
import { rolesImport } from "./roles-import.js";
import { rolesOrganize } from "./roles-organize.js";
import { rolesCheck } from "./roles-check.js";
import { identite } from "./identite.js";
import { rapports } from "./rapports.js";

import { hubRoles } from "./hub-roles.js";

export const commands: Command[] = [
  link,
  unlink,
  profil,
  identite,
  serveur,
  grades,
  candidature,
  wiki,
  aide,
  ping,
  syncRoles,
  syncRolesAdmin,
  hubRoles,
  rolesAdmin,
  rolesImport,
  rolesOrganize,
  rolesCheck,
  rapports,
];

export const commandMap = new Map<string, Command>(
  commands.map((c) => [c.data.name, c]),
);
