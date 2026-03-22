export const translations = {
  en: { welcome: "Welcome to the Forge", wealth: "Wealth", execute: "Execute" },
  es: { welcome: "Bienvenido a la Fragua", wealth: "Riqueza", execute: "Ejecutar" },
  fr: { welcome: "Bienvenue à la Forge", wealth: "Richesse", execute: "Executer" },
} as const;

export type LocaleKey = keyof typeof translations;
