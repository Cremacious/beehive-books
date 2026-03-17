'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { Globe } from 'lucide-react';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
};

export function LocaleSwitcher() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: string) {
    // Replace (or add) the locale prefix in the current path.
    // With localePrefix: 'as-needed', English has no prefix.
    const pathWithoutLocale = pathname.replace(
      new RegExp(`^/(${locales.join('|')})(?=/|$)`),
      '',
    ) || '/';

    const newPath =
      newLocale === 'en'
        ? pathWithoutLocale
        : `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-white/60 shrink-0" aria-hidden="true" />
      <label htmlFor="locale-select" className="text-sm text-white/70 sr-only">
        {t('selectLanguage')}
      </label>
      <select
        id="locale-select"
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-[#2a2a2a] border border-[#3a3a3a] text-white text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#FFC300]/50 cursor-pointer"
        aria-label={t('selectLanguage')}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </div>
  );
}
