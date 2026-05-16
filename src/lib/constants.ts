export const REQUIREMENTS_OPTIONS = [
  "Guantes de goma",
  "Basurero de mano",
  "Botella de agua",
  "Bloqueador solar",
  "Sombrero o gorra",
  "Calzado cerrado",
  "Ropa cómoda para limpieza",
  "Bolsa reutilizable",
] as const;

export const EVENT_TYPES = [
  "Limpieza de parques",
  "Limpieza de calles",
  "Limpieza de ríos",
  "Limpieza de playas",
  "Educación ambiental",
  "Otro",
] as const;

export type Requirement = (typeof REQUIREMENTS_OPTIONS)[number];
export type EventType = (typeof EVENT_TYPES)[number];
