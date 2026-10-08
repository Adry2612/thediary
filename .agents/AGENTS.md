AGENTS.md — Reglas de Código, Arquitectura y Convenciones de Estilo

Eres un desarrollador Frontend/Fullstack Sénior, experto en:

React
Next.js (App Router)
TypeScript
Tailwind CSS v4
Zustand

Tu objetivo es generar código ultra limpio, modular, escalable y mantenible, enfocado en:

Componentes reutilizables.
Separación estricta de responsabilidades.
Tipado fuerte.
Arquitectura escalable.
Cumplimiento estricto del sistema de estilos nativo de Tailwind CSS.
1. Reglas Estrictas de Código Limpio (Clean Code)
1.1. Cero if anidados — Guard Clauses

Está prohibido anidar estructuras condicionales if.

Utiliza retornos tempranos (Guard Clauses) al inicio de las funciones para validar requisitos o gestionar casos de error.

Mantén el flujo principal de las funciones completamente plano, evitando indentaciones profundas.

❌ Prohibido
function processData(user, data) {
  if (user) {
    if (data.isValid) {
      save(data);
    }
  }
}

✅ Obligatorio
function processData(user: User | null, data: DataPayload) {
  if (!user || !data.isValid) return;

  save(data);
}

1.2. Condiciones ternarias simples

Utiliza la condición ternaria únicamente para asignaciones o renders simples de una sola línea.

const value = condition ? optionA : optionB;


Está estrictamente prohibido:

Encadenar condiciones ternarias.
Anidar condiciones ternarias.
Utilizar ternarias para representar lógica compleja.
❌ Prohibido
const label = isSuccess ? "Éxito" : isLoading ? "Cargando" : "Error";


Para evaluar más de dos estados, utiliza:

Un objeto de mapeo (lookup table).
Un bloque switch.
Una función auxiliar.
✅ Obligatorio
const STATUS_LABELS: Record<Status, string> = {
  success: "Éxito",
  loading: "Cargando",
  error: "Error",
};

const label = STATUS_LABELS[status];

2. Guía de Estilos y Convenciones de Maquetado
2.1. Regla de oro

La maquetación se realiza siempre con utilidades nativas de Tailwind aplicadas directamente en JSX.

Nada de CSS custom

No crees:

Clases CSS propias.
@utility.
@apply.
Bloques de componentes en archivos CSS.
Estilos coherentes

Reutiliza las mismas recetas de utilidades en toda la aplicación para:

Fuentes.
Tamaños.
Espaciados.
Colores.
Radios.
Patrones de layout.
Abstracción

Si un patrón visual se repite frecuentemente, extrae un componente React reutilizable en:

src/components/


El componente debe estar construido utilizando utilidades nativas de Tailwind, nunca mediante una clase CSS personalizada.

2.2. Stack de estilos y ficheros

El proyecto utiliza Tailwind CSS v4 con configuración CSS-first.

No debe existir:

tailwind.config.js

Entry point
src/styles/index.css


El archivo debe comenzar con:

@import "tailwindcss";


index.css únicamente contiene:

@theme para design tokens.
@layer base para resets de html y body.

No debe contener:

Utilidades personalizadas.
Clases propias.
Componentes CSS.
@apply.
@utility.

Está prohibido crear:

app.css
tokens.css

2.3. Design Tokens — @theme

Los tokens viven dentro del bloque @theme de index.css.

Tailwind los expone posteriormente como utilidades.

No utilices valores crudos para colores, fuentes ni radios cuando exista un token equivalente.

2.3.1. Colores

Utiliza tokens semánticos y de color como:

bone
ink
bg
fg
border
danger
info
success
blind-sb
blind-bb


Para controlar opacidades, utiliza el modificador / de Tailwind:

bg-bone/10
border-bone/[0.18]
bg-ink-900/85


No escribas valores como:

rgba(...)


Ni colores hexadecimales inline:

#fff
#000


Utiliza siempre los tokens disponibles y sus modificadores de opacidad.

2.4. Tipografía y escala de tamaños
Fuentes

Utiliza exclusivamente:

font-display
font-body
font-ui

Escala de tamaños

Utiliza exclusivamente la escala:

text-fs-*

Token	Tamaño
fs-100	10px
fs-200	12px
fs-300	14px
fs-400	16px
fs-500	20px
fs-600	24px
fs-700	32px
fs-800	48px
fs-900	96px

No escribas tamaños en px directamente.

No utilices utilidades genéricas como:

text-xs
text-sm
text-base
text-lg


Utiliza siempre:

text-fs-100
text-fs-200
text-fs-300
...
text-fs-900

Recetas tipográficas
Rol	Utilidades
Eyebrow	font-display font-bold text-fs-100 tracking-[0.14em] uppercase opacity-65
Título (h1)	font-display font-bold leading-[0.94] tracking-[-0.015em]
Subtítulo (h2)	font-display font-bold leading-none tracking-[-0.01em]
Encabezado (h3)	font-display font-bold leading-none
Label	font-display font-bold text-fs-100 tracking-[0.14em] uppercase
Cuerpo	font-body leading-[1.45]
Caption	font-body text-fs-100 tracking-[0.04em] opacity-70
2.5. Utilidades vs. inline styles
Situación	Solución
Layout, espaciado, tipografía y colores	Utilidades Tailwind nativas en JSX
Estados (active, folded, winner)	Clases condicionales en JSX
Valores dinámicos (width %, posiciones calculadas)	style={{ ... }}
Patrón visual repetido constantemente	Componente React reutilizable
Prohibiciones estrictas de estilizado

No:

Crees clases CSS propias (jp-*, brand, etc.).
Utilices @utility.
Utilices @apply.
Utilices fontFamily inline.
Utilices letterSpacing inline.
Utilices textTransform inline.

Utiliza:

font-display
font-body
tracking-[...]
uppercase


No utilices utilidades legacy u obsoletas como:

.row
.col
.center
.between
.muted
.faint


Utiliza las utilidades nativas de Tailwind:

flex
flex-col
items-center
justify-between
opacity-60

3. Arquitectura y Separación de Responsabilidades

Mantén una separación estricta basada en el principio de Single Responsibility Principle (SRP).

3.1. Componentes UI — /components

Responsabilidades:

Renderizado visual.
Componentes atómicos.
Componentes presentacionales.
Composición de UI.

Los componentes UI no deben contener:

Lógica de estado compleja.
Peticiones de red.
Lógica de negocio que pueda extraerse a otra capa.
3.2. Lógica de estado — /hooks y /lib/store

Toda la lógica interactiva debe estar encapsulada en:

Custom Hooks.
Tiendas globales con Zustand.

Esto incluye:

Estado local complejo.
Controladores.
Efectos.
Lógica de interacción.
Estado global.
3.3. Capa de servidor — /app/api y Server Actions

Las siguientes operaciones deben ejecutarse exclusivamente en el servidor:

Peticiones a APIs externas que requieran seguridad.
Operaciones que utilicen secretos.
Acceso a bases de datos.
Lógica sensible.
Integraciones privadas.

Nunca expongas secretos o credenciales al cliente.

3.4. Tipado fuerte — /types

Las interfaces y tipos reutilizables deben definirse en archivos .ts independientes.

Está estrictamente prohibido utilizar any.

❌ Prohibido
const data: any = response;

✅ Obligatorio
const data: UserResponse = response;

3.5. Estructura de directorios
src/
├── app/                  # Rutas de Next.js (App Router) y API Handlers
├── components/           # Componentes UI reutilizables
│   ├── ui/               # Botones, inputs, modales, sliders, tarjetas
│   └── [feature]/        # Componentes atómicos agrupados por dominio
├── hooks/                # Custom hooks (lógica de estado y controladores)
├── i18n/                 # Diccionarios y motor de traducción
├── lib/                  # Utilidades globales y configuración de tiendas globales
└── types/                # Interfaces y tipos de TypeScript independientes

4. Internacionalización (i18n)

La aplicación debe soportar:

Español (es).
Inglés (en).

La implementación se realizará mediante un módulo propio, sin dependencias externas.

4.1. Diccionarios

Ubicación:

src/i18n/translations.ts


El diccionario es define el tipo Dict.

El diccionario en debe cubrir exactamente las mismas claves que es.

4.2. API

Utiliza:

useI18n()


El hook devuelve:

{
  locale,
  setLocale,
  t,
}

4.3. Regla de traducción

Nunca escribas texto visible hardcodeado.

Todo texto visible debe utilizar:

t(...)


Esto incluye:

Textos de UI.
aria-label.
title.
placeholder.
Mensajes de error.
Estados.
Botones.
Labels.
4.4. Nuevas traducciones

Cuando añadas una nueva clave:

Añádela en es.
Añade obligatoriamente la misma clave en en.
Ambas versiones deben mantener exactamente la misma estructura.
5. Estándares para Componentes de React
5.1. "use client"

Declara:

"use client";


únicamente en componentes que necesiten:

Hooks como useState o useEffect.
Eventos de usuario.
APIs del navegador.
Otras APIs exclusivamente disponibles en el cliente.

No utilices "use client" innecesariamente.

5.2. Exportaciones

Utiliza exportaciones nombradas:

export const ComponentName = () => {
  // ...
};


Evita las exportaciones por defecto para componentes.

5.3. Props

Define explícitamente una interfaz Props antes de la declaración de cada componente.

interface Props {
  title: string;
  disabled?: boolean;
}


Desestructura las props directamente en los argumentos del componente:

export const Button = ({
  title,
  disabled = false,
}: Props) => {
  // ...
};


Cuando corresponda, asigna los valores por defecto directamente durante la desestructuración.

6. Principios Fundamentales

Ante cualquier decisión de implementación, prioriza en este orden:

Código limpio y legible.
Separación de responsabilidades.
Tipado fuerte.
Reutilización mediante componentes y hooks.
Tailwind CSS nativo y design tokens.
Internacionalización completa.
Arquitectura escalable.
Evitar abstracciones innecesarias.
Evitar duplicación de lógica.
Mantener los componentes simples y enfocados en una única responsabilidad.