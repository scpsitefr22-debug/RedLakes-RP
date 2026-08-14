import { redirect } from "next/navigation";
import { DevConsole } from "@/components/console/DevConsole";

export const metadata = {
  title: "Console de contrôle — REDLAKES RP",
  robots: { index: false, follow: false },
};

export default function ConsolePage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return (
    <>
      <DevConsole />
    </>
  );
}
