import { apiFetch } from "@/lib/api";

export interface ClassifiedDocumentSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  tags: string[];
  faction: { id: string; slug: string; name: string; color: string | null } | null;
  publishedAt: string | null;
}

export interface LinkedEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
}

export interface LinkedScpObject {
  id: string;
  slug: string;
  number: string;
  name: string;
  class: string;
}

export interface ClassifiedDocumentFull extends ClassifiedDocumentSummary {
  content: string;
  attachments: string[];
  author: { minecraftUsername: string | null } | null;
  linkedEvents: LinkedEvent[];
  linkedScpObjects: LinkedScpObject[];
}

export async function getClassifiedDocuments(): Promise<ClassifiedDocumentSummary[]> {
  try {
    return await apiFetch<ClassifiedDocumentSummary[]>("/classified-documents");
  } catch {
    return [];
  }
}

export async function getClassifiedDocument(
  slug: string,
): Promise<ClassifiedDocumentFull | null> {
  try {
    return await apiFetch<ClassifiedDocumentFull>(`/classified-documents/${slug}`);
  } catch {
    return null;
  }
}
