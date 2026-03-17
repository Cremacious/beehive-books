import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Default locale has no URL prefix (/home instead of /en/home)
  localePrefix: 'as-needed',
});
