/**
 * Reglas de validación de los diálogos de cuenta.
 *
 * Son comparaciones exactas, sin recortar espacios: lo que el usuario escribe
 * es lo que se compara, igual que lo hacía el componente.
 */

/** Palabra que hay que escribir para confirmar el borrado de los datos. */
export const DELETE_CONFIRMATION_WORD = "BORRAR";

/** Si la contraseña y su repetición coinciden. */
export function passwordsMatch(password: string, confirmation: string): boolean {
  return password === confirmation;
}

/** Si lo escrito confirma el borrado, y no otra cosa. */
export function isDeleteConfirmation(word: string): boolean {
  return word === DELETE_CONFIRMATION_WORD;
}
