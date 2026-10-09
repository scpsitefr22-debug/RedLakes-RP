// Lance le site en local (code de la branche en cours) branché sur l'API EN LIGNE :
// vraies données, vrais comptes. Sert à relire une refonte avant de la publier.
// Attention : tout ce qu'on modifie dans cette fenêtre modifie le vrai site.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE_API = "https://redlakes-api.onrender.com/api";

const child = spawn("npm", ["run", "dev", "--prefix", "apps/web"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, API_URL: LIVE_API, NEXT_PUBLIC_API_URL: LIVE_API },
});
child.on("exit", (code) => process.exit(code ?? 0));
