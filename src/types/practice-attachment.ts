export const ATTACHMENT_TYPES = ["tab", "pdf", "youtube", "spotify"] as const;

export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

export type TabInputMode = "text" | "file";

export interface AttachmentDraft {
  title: string;
  url: string;
  text: string;
}
