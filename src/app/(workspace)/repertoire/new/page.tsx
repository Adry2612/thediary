import { redirect } from 'next/navigation';

/**
 * La creación de un elemento vive ahora en un diálogo sobre el repertorio.
 * Esta ruta se conserva para que los enlaces antiguos no acaben en un 404.
 */
export default function NewRepertoireItemPage() {
  redirect('/repertoire');
}
