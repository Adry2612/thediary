export interface TutorialStep {
  title: string;
  description: string;
  target: string;
  href?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Bienvenido a thediary",
    description:
      "Organiza tu práctica musical, guarda tus grabaciones y sigue tu progreso. Este recorrido te mostrará dónde encontrar cada herramienta.",
    target: "brand",
  },
  {
    title: "Prepara una práctica",
    description:
      "Divide tu sesión en bloques, asigna tiempo y elige qué quieres trabajar. Guarda una plantilla si quieres volver a usar el mismo plan.",
    target: "practice-plan",
    href: "/practice",
  },
  {
    title: "Consulta tu progreso",
    description:
      "Aquí puedes revisar tus objetivos semanales, la constancia y el tiempo que has dedicado a practicar.",
    target: "dashboard-summary",
    href: "/dashboard",
  },
  {
    title: "Tempo y herramientas",
    description:
      "En el metrónomo ajusta el tempo con las marcas de color y configura subdivisión y volumen. Desde el menú superior también puedes abrir tu repertorio y tus grabaciones.",
    target: "metronome-controls",
    href: "/metronome",
  },
  {
    title: "Cuenta y configuración",
    description:
      "En Configuración puedes iniciar sesión para sincronizar tus datos, cambiar la contraseña, cerrar sesión o borrar los datos de práctica.",
    target: "settings-account",
    href: "/settings",
  },
];
