'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
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
  const pathname = usePathname(); // locale-stripped path e.g. /home, /settings

  function handleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-white/60 shrink-0" aria-hidden="true" />
      <label htmlFor="locale-select" className="sr-only">
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
