"use client";

import { useEffect } from "react";
import { recordScpView } from "@/lib/scp-history";

export function RecordScpView({
  slug,
  number,
  name,
  scpClass,
}: {
  slug: string;
  number: string;
  name: string;
  scpClass: string;
}) {
  useEffect(() => {
    recordScpView({ slug, number, name, class: scpClass });
  }, [slug, number, name, scpClass]);

  return null;
}
