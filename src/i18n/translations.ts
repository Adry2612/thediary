import { en } from './en.ts';
import { es } from './es.ts';
import type { Dict } from './dictionary.ts';

Object.assign(es.repertoire, {
  artist: 'Artista',
  extraConfig:
    'Configuraciones extra (afinación, capotraste, tipo de guitarra)',
  tuning: 'Afinación',
  customTuning: 'Afinación personalizada',
  capo: 'Capotraste (traste)',
  guitarType: 'Tipo de guitarra',
  unspecified: 'Sin especificar',
  electric: 'Eléctrica',
  acoustic: 'Acústica',
  deleteItem: 'Eliminar elemento',
  addPart: 'Añadir parte',
  parts: 'Partes',
  deleteConfirm:
    '¿Eliminar este elemento del repertorio? Las sesiones permanecerán en el historial general, pero sus horas dejarán de mostrarse aquí.',
  quickPractice: 'Práctica rápida',
});
Object.assign(es.repertoire, {
  titlePlaceholder: 'Master of Puppets',
  lickPlaceholder: 'Frase en La menor',
  artistPlaceholder: 'Metallica',
  guitarProOptional: 'Archivo Guitar Pro · opcional',
  selectGuitarPro: 'Seleccionar archivo .gp',
  customTuningPlaceholder: 'Ej. CGCFAD, DADGAD, etc.',
  capoAria: 'Traste del capotraste (0-12)',
  youtubeOptional: 'Enlace de YouTube · opcional',
  spotifyOptional: 'Enlace de Spotify · opcional',
  youtubeAria: 'Enlace de YouTube',
  spotifyAria: 'Enlace de Spotify',
  futureLearn: 'Añadir a «Aprender en el futuro»',
  saving: 'Guardando…',
  addSong: 'Añadir canción',
  addLick: 'Añadir lick',
  resourceError: 'No se pudo guardar el elemento del repertorio.',
});
Object.assign(es.practice, {
  splitView: 'Vista dividida',
  singleView: 'Vista única',
});
Object.assign(en.practice, {
  splitView: 'Split view',
  singleView: 'Single view',
});
Object.assign(en.repertoire, {
  titlePlaceholder: 'Master of Puppets',
  lickPlaceholder: 'A minor phrase',
  artistPlaceholder: 'Metallica',
  guitarProOptional: 'Guitar Pro file · optional',
  selectGuitarPro: 'Select .gp file',
  customTuningPlaceholder: 'e.g. CGCFAD, DADGAD, etc.',
  capoAria: 'Capo fret (0-12)',
  youtubeOptional: 'YouTube link · optional',
  spotifyOptional: 'Spotify link · optional',
  youtubeAria: 'YouTube link',
  spotifyAria: 'Spotify link',
  futureLearn: 'Add to «Learn in the future»',
  saving: 'Saving…',
  addSong: 'Add song',
  addLick: 'Add lick',
  resourceError: 'Could not save the repertoire item.',
  quickPractice: 'Quick practice',
});
Object.assign(en.repertoire, {
  artist: 'Artist',
  extraConfig: 'Extra settings (tuning, capo, guitar type)',
  tuning: 'Tuning',
  customTuning: 'Custom tuning',
  capo: 'Capo (fret)',
  guitarType: 'Guitar type',
  unspecified: 'Not specified',
  electric: 'Electric',
  acoustic: 'Acoustic',
  deleteItem: 'Delete item',
  addPart: 'Add part',
  parts: 'Parts',
  deleteConfirm:
    'Delete this item from your repertoire? Sessions will remain in your general history, but their hours will no longer appear here.',
});
es.tutorial = {
  steps: [
    {
      title: 'Bienvenido a thediary',
      description:
        'Organiza tu práctica musical, guarda tus grabaciones y sigue tu progreso. Este recorrido te mostrará dónde encontrar cada herramienta.',
    },
    {
      title: 'Prepara una práctica',
      description:
        'Divide tu sesión en bloques, asigna tiempo y elige qué quieres trabajar. Guarda una plantilla si quieres volver a usar el mismo plan.',
    },
    {
      title: 'Consulta tu progreso',
      description:
        'Aquí puedes revisar tus objetivos semanales, la constancia y el tiempo que has dedicado a practicar.',
    },
    {
      title: 'Tempo y herramientas',
      description:
        'En el metrónomo ajusta el tempo y configura subdivisión y volumen. Desde el menú superior también puedes abrir tu repertorio y tus grabaciones.',
    },
    {
      title: 'Cuenta y configuración',
      description:
        'En Configuración puedes iniciar sesión para sincronizar tus datos, cambiar la contraseña, cerrar sesión o borrar los datos de práctica.',
    },
  ],
  progress: 'Progreso del tutorial',
  saveError: 'No se pudo guardar el progreso del tutorial',
  skip: 'Omitir',
  previous: 'Anterior',
  next: 'Siguiente',
  finish: 'Terminar tutorial',
};
en.tutorial = {
  steps: [
    {
      title: 'Welcome to thediary',
      description:
        'Organize your music practice, save recordings, and track your progress. This tour will show you where to find each tool.',
    },
    {
      title: 'Prepare a practice',
      description:
        'Split your session into blocks, assign time, and choose what to work on. Save a template if you want to reuse the same plan.',
    },
    {
      title: 'Review your progress',
      description:
        'Review your weekly goals, consistency, and the time you have spent practicing here.',
    },
    {
      title: 'Tempo and tools',
      description:
        'Adjust tempo in the metronome and configure subdivision and volume. Use the top navigation to open your repertoire and recordings.',
    },
    {
      title: 'Account and settings',
      description:
        'In Settings you can sign in to sync your data, change your password, sign out, or delete practice data.',
    },
  ],
  progress: 'Tutorial progress',
  saveError: 'Could not save tutorial progress',
  skip: 'Skip',
  previous: 'Previous',
  next: 'Next',
  finish: 'Finish tutorial',
};
Object.assign(es.settings, {
  guest: 'Modo invitado',
  accountSync: 'Cuenta y sincronización',
  signIn: 'Iniciar sesión',
  accountSaved:
    'Tus datos se guardan en tu cuenta y se sincronizan entre dispositivos.',
  accountPrompt:
    'Inicia sesión o crea una cuenta para sincronizar tus datos entre dispositivos.',
  help: 'Ayuda',
  tutorialTitle: 'Tutorial de thediary',
  tutorialDescription:
    'Vuelve a recorrer las secciones y descubre cómo usar la app.',
  viewTutorial: 'Ver tutorial',
  security: 'Seguridad',
  password: 'Contraseña',
  passwordDescription: 'Actualiza la contraseña de acceso a tu cuenta.',
  changePassword: 'Cambiar contraseña',
  session: 'Sesión',
  signOut: 'Cerrar sesión',
  signOutDescription: 'Cierra tu sesión en este dispositivo.',
  data: 'Datos',
  deleteAll: 'Eliminar todos los datos',
  deleteDescription:
    'Borra las sesiones, rutinas, repertorio y archivos de práctica. La cuenta se conservará.',
  deleteData: 'Eliminar datos',
});
Object.assign(en.settings, {
  guest: 'Guest mode',
  accountSync: 'Account and sync',
  signIn: 'Sign in',
  accountSaved: 'Your data is saved to your account and synced across devices.',
  accountPrompt:
    'Sign in or create an account to sync your data across devices.',
  help: 'Help',
  tutorialTitle: 'thediary tutorial',
  tutorialDescription: 'Review the sections and discover how to use the app.',
  viewTutorial: 'View tutorial',
  security: 'Security',
  password: 'Password',
  passwordDescription: 'Update your account password.',
  changePassword: 'Change password',
  session: 'Session',
  signOut: 'Sign out',
  signOutDescription: 'Sign out on this device.',
  data: 'Data',
  deleteAll: 'Delete all data',
  deleteDescription:
    'Delete sessions, routines, repertoire, and practice files. Your account will be kept.',
  deleteData: 'Delete data',
});
Object.assign(es.settings, {
  support: 'Apoyo',
  supportTitle: 'Buy Me a Coffee',
  supportDescription:
    'thediary es completamente gratis porque surgió de una necesidad propia y quiero que todo el mundo pueda disfrutarlo. Pero, si quieres apoyarme de alguna manera, puedes invitarme a un café.',
  supportButton: 'Buy me a coffee',
  supportStatus:
    'El botón se activará cuando me proporciones el enlace a tu perfil.',
});
Object.assign(en.settings, {
  support: 'Support',
  supportTitle: 'Buy Me a Coffee',
  supportDescription:
    'thediary is completely free because it started from a personal need and I want everyone to enjoy it. If you would like to support me, you can buy me a coffee.',
  supportButton: 'Buy me a coffee',
  supportStatus:
    'This button will be enabled once you provide a link to your profile.',
});

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const translations: Record<Locale, Dict> = { es, en };
export const defaultLocale: Locale = 'es';
export function getDictionary(locale: Locale = defaultLocale): Dict {
  return translations[locale];
}
export function isLocale(value: string): value is Locale {
  return value === 'es' || value === 'en';
}
