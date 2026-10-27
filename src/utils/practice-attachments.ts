import { getPracticeFileKind } from "./practice-templates.ts";
import type { PracticeResourceKind } from "../types/practice.ts";
import type { AttachmentType } from "../types/practice-attachment.ts";

export type StoredFileKind = NonNullable<
  ReturnType<typeof getPracticeFileKind>
>;

/**
 * Presentación y validación de cada tipo de material adjunto. Se centraliza
 * aquí para que el menú, el formulario y el hook no mantengan listas paralelas
 * que se desincronicen al añadir un tipo nuevo.
 */
export type AttachmentOption = {
  label: string;
  hint: string;
  heading: string;
  /** Cómo se introduce el material en el formulario. */
  input: "text-or-file" | "file" | "url";
  resourceKind: PracticeResourceKind;
  defaultTitle: string;
  /** Extensiones o MIME que acepta el selector de archivos. */
  accept: string;
  fileHint: string;
  fileKinds: StoredFileKind[];
  fileError: string;
  /** Tamaño máximo aceptado antes de subir, si el tipo lo impone. */
  maxBytes?: number;
  sizeError?: string;
  url?: {
    label: string;
    placeholder: string;
  };
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const ATTACHMENT_OPTIONS: Record<AttachmentType, AttachmentOption> = {
  tab: {
    label: "TAB",
    hint: "Texto o archivo",
    heading: "Añadir TAB",
    input: "text-or-file",
    resourceKind: "tab",
    defaultTitle: "Tablatura",
    accept: ".gp,.gpx,.gp3,.gp4,.gp5,.txt,text/plain",
    fileHint: "Guitar Pro (.gp, .gpx, .gp3–.gp5) o texto (.txt)",
    fileKinds: ["guitarpro"],
    fileError:
      "Sube un archivo Guitar Pro (.gp, .gpx, .gp3–.gp5) o de texto (.txt).",
  },
  pdf: {
    label: "PDF",
    hint: "Documento",
    heading: "Añadir PDF",
    input: "file",
    resourceKind: "pdf",
    defaultTitle: "Documento PDF",
    accept: "application/pdf,.pdf",
    fileHint: "Archivo PDF",
    fileKinds: ["pdf"],
    fileError: "Sube un archivo PDF.",
  },
  image: {
    label: "Imagen",
    hint: "Foto o diagrama",
    heading: "Añadir imagen",
    input: "file",
    resourceKind: "image",
    defaultTitle: "Imagen",
    accept: "image/jpeg,image/png,image/webp,image/avif,image/gif,.jpg,.jpeg,.png,.webp,.avif,.gif",
    fileHint: "JPG, PNG, WebP, AVIF o GIF (máximo 10 MB)",
    fileKinds: ["image"],
    fileError:
      "Sube una imagen JPG, PNG, WebP, AVIF o GIF. Los formatos SVG y HEIC no están admitidos.",
    maxBytes: MAX_IMAGE_BYTES,
    sizeError: "La imagen supera el límite de 10 MB.",
  },
  songsterr: {
    label: "Songsterr",
    hint: "Enlace de canción",
    heading: "Añadir enlace de Songsterr",
    input: "url",
    resourceKind: "songsterr",
    defaultTitle: "Songsterr",
    accept: "",
    fileHint: "",
    fileKinds: [],
    fileError: "",
    url: {
      label: "Enlace de Songsterr",
      placeholder: "https://www.songsterr.com/a/wa/song?id=…",
    },
  },
  youtube: {
    label: "YouTube",
    hint: "Enlace de vídeo",
    heading: "Añadir vídeo de YouTube",
    input: "url",
    resourceKind: "youtube",
    defaultTitle: "Vídeo de YouTube",
    accept: "",
    fileHint: "",
    fileKinds: [],
    fileError: "",
    url: {
      label: "Enlace de YouTube",
      placeholder: "https://www.youtube.com/watch?v=…",
    },
  },
  spotify: {
    label: "Spotify",
    hint: "Enlace de canción",
    heading: "Añadir canción de Spotify",
    input: "url",
    resourceKind: "spotify",
    defaultTitle: "Canción de Spotify",
    accept: "",
    fileHint: "",
    fileKinds: [],
    fileError: "",
    url: {
      label: "Enlace de Spotify",
      placeholder: "https://open.spotify.com/track/…",
    },
  },
};
