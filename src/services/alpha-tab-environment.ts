import type * as AlphaTab from "@coderline/alphatab";

export const ALPHA_TAB_FONT_DIRECTORY = "/alphatab/font/";
export const ALPHA_TAB_WORKER_URL = "/alphatab/alphaTab.worker.mjs";
export const ALPHA_TAB_SOUNDFONT_URL = "/alphatab/soundfont/sonivox.sf2";

type AlphaTabEnvironment = {
  webPlatform?: number;
  alphaTabUrl?: unknown;
};

/**
 * alphaTab resuelve sus workers contra `import.meta.url`. Turbopack lo expone
 * como `file:///ROOT/...`, una URL que el navegador no puede cargar, y acaba
 * creando un worker blob que tampoco arranca. Se fuerza la base pública de
 * `/alphatab/` y la plataforma de módulo para que use un worker directo.
 *
 * Debe llamarse antes de crear cualquier `AlphaTabApi`.
 */
export function configureAlphaTabEnvironment(
  alphaTab: typeof AlphaTab,
): void {
  if (typeof window === "undefined") return;

  const environment = (
    alphaTab as unknown as { Environment: AlphaTabEnvironment }
  ).Environment;
  environment.webPlatform = alphaTab.WebPlatform.BrowserModule;

  Object.defineProperty(environment, "alphaTabUrl", {
    configurable: true,
    value: class extends URL {
      constructor(path: string) {
        super(path, `${window.location.origin}/alphatab/`);
      }
    },
  });
}
