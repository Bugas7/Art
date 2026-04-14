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
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href={`/${locale}`} className="text-2xl font-light tracking-wide text-stone-800 transition-opacity hover:opacity-70">
          {artist.name[locale]}
        </Link>
        <div className="flex items-center gap-12">
          <nav className="hidden gap-8 text-sm uppercase tracking-widest text-stone-500 md:flex">
            <Link
              href={`/${locale}`}
              className="transition-colors hover:text-stone-800"
            >
              {dictionary.gallery}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="transition-colors hover:text-stone-800"
            >
              {dictionary.about}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="transition-colors hover:text-stone-800"
            >
              {dictionary.contact}
            </Link>
          </nav>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}



