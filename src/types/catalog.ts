/** Catálogos externos que pueden aportar metadatos a una canción. */
export type CatalogSource = "itunes" | "deezer";

/**
 * Una canción tal como la devuelve un catálogo. Solo lleva lo que el catálogo
 * sabe: el título, el artista, el álbum, el año y la carátula. La afinación, el
 * capo y las partes siguen siendo del usuario.
 */
export interface CatalogCandidate {
  source: CatalogSource;
  id: string;
  title: string;
  artist: string;
  album?: string;
  releaseYear?: number;
  coverUrl?: string;
}

/**
 * Resultado de una búsqueda. `degraded` distingue «el catálogo no contestó» de
 * «no hay coincidencias», que para el usuario son mensajes distintos.
 */
export interface CatalogSearchOutcome {
  results: CatalogCandidate[];
  degraded: boolean;
}
