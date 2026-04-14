import Link from 'next/link';
import { artist } from '@/data/artist';
import { type Locale } from '@/i18n/config';

export default function Footer({ locale }: { locale: Locale }) {
  const dictionary = {
    en: { contact: 'Contact' },
    de: { contact: 'Kontakt' },
    uk: { contact: 'Контакти' },
    ru: { contact: 'Контакты' },
  }[locale];

  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-lg font-light text-stone-700">{artist.name[locale]}</p>
            <p className="text-sm text-stone-400">
              {artist.name.en} &middot; {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex gap-6 text-sm text-stone-500">
            <a
              href={artist.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-stone-800"
            >
              Instagram
            </a>
            <a
              href={artist.singulart}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-stone-800"
            >
              Singulart
            </a>
            <Link
              href={`/${locale}/contact`}
              className="transition-colors hover:text-stone-800"
            >
              {dictionary.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

