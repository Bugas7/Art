'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { locales, labels, type Locale } from '@/i18n/config';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPathForLocale = (locale: string) => {
    if (!pathname) return `/${locale}`;
    const segments = pathname.split('/');
    segments[1] = locale;
    return segments.join('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-stone-200 bg-white/50 px-4 py-2 text-xs font-medium uppercase tracking-widest text-stone-600 backdrop-blur-sm transition-all hover:border-stone-400 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200"
      >
        <span>{currentLocale}</span>
        <svg
          className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-2 w-48 origin-top-right overflow-hidden rounded-2xl border border-stone-100 bg-white/80 p-1 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1">
          {locales.map((locale) => (
            <Link
              key={locale}
              href={getPathForLocale(locale)}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-medium uppercase tracking-widest transition-all ${
                currentLocale === locale
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              <span>{labels[locale]}</span>
              {currentLocale === locale && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

