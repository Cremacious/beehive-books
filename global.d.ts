import en from './messages/en.json';

// Type-safe translations: any missing key will be a TypeScript error.
declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof en;
  }
}
