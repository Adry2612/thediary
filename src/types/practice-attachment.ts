export const ATTACHMENT_TYPES = [
  "guitarpro",
  "pdf",
  "image",
  "songsterr",
  "youtube",
  "spotify",
] as const;

export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

export interface AttachmentDraft {
  title: string;
  url: string;
}
