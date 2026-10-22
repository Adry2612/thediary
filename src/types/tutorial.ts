/**
 * Medidas del elemento al que apunta un paso del tutorial, tal como las
 * devuelve `getBoundingClientRect`.
 */
export interface TargetBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** Medidas de la ventana. */
export interface ViewportSize {
  width: number;
  height: number;
}

/** Medidas de un elemento colocado, como el diálogo del tutorial. */
export interface ElementSize {
  width: number;
  height: number;
}

/** Cambio de paso que está esperando a que la pantalla llegue a su destino. */
export interface PendingTutorialTransition {
  pathname: string;
  stepIndex: number;
  resolve: () => void;
  timeoutId: number;
  visualTransition: boolean;
}

/** Textos del tutorial que necesita el proveedor para pintarlo. */
export type TutorialText = {
  steps: Array<{ title: string; description: string }>;
  progress: string;
  saveError: string;
  skip: string;
  previous: string;
  next: string;
  finish: string;
};
