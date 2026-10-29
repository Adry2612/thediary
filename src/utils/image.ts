import { MAX_IMAGE_BYTES } from "./practice-attachments.ts";

/** Formatos que el navegador puede reducir de forma fiable. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.avif,.gif,.heic,.heif";

/** Lado mayor de la foto guardada. Una foto de móvil ronda los 4000 px. */
export const MAX_IMAGE_SIDE = 1200;

/** Calidad del WebP resultante: reduce sin artefactos visibles en una miniatura. */
export const IMAGE_QUALITY = 0.82;

export type ImageValidationError = "unsupported" | "too-large" | null;

const EXTENSION_PATTERN = /\.(jpe?g|png|webp|avif|gif|heic|heif)$/i;

/**
 * Tamaño de la foto guardada: nunca agranda y conserva la proporción. Es pura
 * para poder probarla sin navegador.
 */
export function getScaledDimensions(
  width: number,
  height: number,
  maxSide: number = MAX_IMAGE_SIDE,
): { width: number; height: number } {
  if (!(width > 0) || !(height > 0)) return { width: 0, height: 0 };
  if (!(maxSide > 0)) {
    return { width: Math.round(width), height: Math.round(height) };
  }

  const longestSide = Math.max(width, height);
  if (longestSide <= maxSide) {
    return { width: Math.round(width), height: Math.round(height) };
  }

  const ratio = maxSide / longestSide;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

type ImageFileLike = { type?: string; name?: string; size: number };

export function validateImageFile(file: ImageFileLike): ImageValidationError {
  const type = (file.type ?? "").toLowerCase();
  const name = file.name ?? "";
  const supported =
    ACCEPTED_IMAGE_TYPES.includes(
      type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    ) || EXTENSION_PATTERN.test(name);

  if (!supported) return "unsupported";
  if (file.size > MAX_IMAGE_BYTES) return "too-large";
  return null;
}

/**
 * Comprueba que el navegador sabe decodificar la imagen antes de aceptarla: un
 * HEIC en un navegador sin soporte se rechaza aquí y no al guardar la ficha.
 */
export async function canDecodeImage(file: File): Promise<boolean> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
    return true;
  } catch {
    return false;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function loadImageElement(
  file: File,
): Promise<{ image: HTMLImageElement; url: string }> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("No se pudo leer la imagen.");
  }
  return { image, url };
}

/**
 * Reduce la foto antes de guardarla. La orientación EXIF la aplica el propio
 * navegador al decodificar, así que una foto vertical no se guarda girada.
 */
export async function compressImage(file: File): Promise<Blob> {
  const { image, url } = await loadImageElement(file);

  try {
    const { width, height } = getScaledDimensions(
      image.naturalWidth,
      image.naturalHeight,
    );
    if (width === 0 || height === 0) {
      throw new Error("La imagen no tiene un tamaño válido.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la imagen.");

    context.drawImage(image, 0, 0, width, height);

    const webp = await canvasToBlob(canvas, "image/webp", IMAGE_QUALITY);
    if (webp && webp.type === "image/webp") return webp;

    const jpeg = await canvasToBlob(canvas, "image/jpeg", IMAGE_QUALITY);
    if (jpeg) return jpeg;

    throw new Error("No se pudo reducir la imagen.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
