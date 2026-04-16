import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { type Locale } from '@/i18n/config';
import { artist } from '@/data/artist';

export default function Header({ locale }: { locale: Locale }) {
  const dictionary = {
    en: { gallery: 'Gallery', about: 'About', contact: 'Contact' },
    de: { gallery: 'Galerie', about: 'Über mich', contact: 'Kontakt' },
    uk: { gallery: 'Галерея', about: 'Про авторку', contact: 'Контакти' },
    ru: { gallery: 'Галерея', about: 'О художнике', contact: 'Контакты' },
  }[locale];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        {/* Top Row: Logo + Lang Switcher */}
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-light tracking-wide text-stone-800 transition-opacity hover:opacity-70 md:text-2xl">
            {artist.name[locale]}
          </Link>
          <LanguageSwitcher currentLocale={locale} />
        </div>
        
        {/* Bottom Row (Mobile) / Integrated Row (Desktop) */}
        <nav className="mt-4 flex justify-center gap-6 border-t border-stone-50 pt-4 text-[10px] uppercase tracking-[0.2em] text-stone-400 md:mt-0 md:border-none md:pt-0 md:text-sm md:text-stone-500 md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2">
          <Link href={`/${locale}`} className="transition-colors hover:text-stone-800">
            {dictionary.gallery}
          </Link>
          <Link href={`/${locale}/about`} className="transition-colors hover:text-stone-800">
            {dictionary.about}
          </Link>
          <Link href={`/${locale}/contact`} className="transition-colors hover:text-stone-800">
            {dictionary.contact}
          </Link>
        </nav>
      </div>
    </header>
  );
}



