'use client';

import { useState, use } from 'react';
import { artworks } from '@/data/artworks';
import ArtworkCard from '@/components/ArtworkCard';
import { type Locale } from '@/i18n/config';

export default function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Load dictionary for static text
  const dictionary = {
    en: { all: 'All Works' },
    de: { all: 'Alle Werke' },
    uk: { all: 'Всі роботи' },
    ru: { all: 'Все работы' },
  }[locale];

  const categories = Array.from(new Set(artworks.map((w) => w.category[locale])));
  
  // Mapping for filtering (using RU as internal key or just checking the current locale value)
  const filteredArtworks =
    activeCategory === 'all'
      ? artworks
      : artworks.filter((a) => a.category[locale] === activeCategory);

  const homeContent = {
    en: {
      title: 'Iryna Barabash',
      subtitle: 'Oil paintings exploring themes of memory, heritage, and the beauty of nature. Each painting is a story told through light, color, and texture.'
    },
    de: {
      title: 'Iryna Barabash',
      subtitle: 'Ölgemälde, die Themen wie Erinnerung, Erbe und die Schönheit der Natur erforschen. Jedes Gemälde ist eine Geschichte, die durch Licht, Farbe und Textur erzählt wird.'
    },
    uk: {
      title: 'Ірина Барабаш',
      subtitle: 'Олійний живопис, що досліджує теми пам\'яті, спадщини та краси природи. Кожна картина — це історія, розказана через світло, колір та текстуру.'
    },
    ru: {
      title: 'Ирина Барабаш',
      subtitle: 'Масляная живопись, исследующая темы памяти, наследия и красоты природы. Каждая картина — история, рассказанная через свет, цвет и текстуру.'
    }
  }[locale];

  return (
    <div className="bg-stone-50">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-20 text-center md:pt-28">
        <h1 className="font-serif text-4xl font-light text-stone-800 md:text-5xl lg:text-6xl">
          {homeContent.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-light leading-relaxed text-stone-500">
          {homeContent.subtitle}
        </p>
      </section>

      {/* Category Filter */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-5 py-2 text-sm tracking-wide transition-colors ${activeCategory === 'all'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
          >
            {dictionary.all}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm tracking-wide transition-colors ${activeCategory === cat
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}

