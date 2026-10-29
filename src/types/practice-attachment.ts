export const ATTACHMENT_TYPES = [
  "tab",
  "pdf",
  "image",
  "songsterr",
  "youtube",
  "spotify",
] as const;

export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

export type TabInputMode = "text" | "file";

export interface AttachmentDraft {
  title: string;
  url: string;
  text: string;
}
