import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // React Compiler rule: flags the standard "fetch in useEffect, setState
      // with the result" pattern used throughout this app's client components
      // (NotificationBell, StaffDashboard, IntranetTerminal, etc). Fixing this
      // properly requires moving those components to Suspense/`use()` or a
      // data-fetching library — a real architecture change, not a bug fix.
      // Downgraded to a warning so it stays visible without blocking `npm run lint`.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
