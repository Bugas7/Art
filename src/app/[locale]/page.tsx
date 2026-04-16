'use client';

import { useState, use, useMemo, useEffect } from 'react';
import { artworks } from '@/data/artworks';
import ArtworkCard from '@/components/ArtworkCard';
import { type Locale } from '@/i18n/config';

export default function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Load category from sessionStorage on mount
  useEffect(() => {
    const savedCategory = sessionStorage.getItem('art-gallery-category');
    if (savedCategory) {
      setActiveCategory(savedCategory);
    }
    const savedSortOrder = sessionStorage.getItem('art-gallery-sort');
    if (savedSortOrder) {
      setSortOrder(savedSortOrder as 'newest' | 'oldest');
    }
  }, []);

  // Save category to sessionStorage whenever it changes
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    sessionStorage.setItem('art-gallery-category', cat);
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    sessionStorage.setItem('art-gallery-sort', order);
  };

  // Memoize dictionary for static text
  const dictionary = useMemo(() => ({
    en: { all: 'All Works', sort: 'Sort by', newest: 'Newest', oldest: 'Oldest' },
    de: { all: 'Alle Werke', sort: 'Sortieren nach', newest: 'Neueste', oldest: 'Älteste' },
    uk: { all: 'Всі роботи', sort: 'Сортувати', newest: 'Спочатку нові', oldest: 'Спочатку старі' },
    ru: { all: 'Все работы', sort: 'Сортировать', newest: 'Сначала новые', oldest: 'Сначала старые' },
  }[locale]), [locale]);

  // Memoize unique artworks once
  const uniqueArtworks = useMemo(() => 
    Array.from(new Map(artworks.map(a => [a.id, a])).values()),
    []
  );

  // Memoize unique categories with their translations
  const { categoryMap, categoryKeys } = useMemo(() => {
    const map = artworks.reduce((acc, curr) => {
      const enName = curr.category.en;
      if (!acc[enName]) {
        acc[enName] = curr.category;
      }
      return acc;
    }, {} as Record<string, typeof artworks[0]['category']>);

    return {
      categoryMap: map,
      categoryKeys: Object.keys(map).sort()
    };
  }, []);

  // Filtering and sorting
  const processedArtworks = useMemo(() => {
    return uniqueArtworks
      .filter((a) => activeCategory === 'all' || a.category.en === activeCategory)
      .sort((a, b) => {
        if (sortOrder === 'newest') return b.year - a.year;
        return a.year - b.year;
      });
  }, [uniqueArtworks, activeCategory, sortOrder]);


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

      {/* Category Filter & Sort */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`rounded-full px-5 py-2 text-sm tracking-wide transition-colors ${activeCategory === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100'
                }`}
            >
              {dictionary.all}
            </button>
            {categoryKeys.map((catKey) => (
              <button
                key={catKey}
                onClick={() => handleCategoryChange(catKey)}
                className={`rounded-full px-5 py-2 text-sm tracking-wide transition-colors ${activeCategory === catKey
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-100'
                  }`}
              >
                {categoryMap[catKey][locale]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-stone-100 pt-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {dictionary.sort}:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('newest')}
                className={`text-[10px] uppercase tracking-widest transition-colors ${sortOrder === 'newest' ? 'font-bold text-stone-800 underline underline-offset-4' : 'text-stone-400 hover:text-stone-600'}`}
              >
                {dictionary.newest}
              </button>
              <span className="text-stone-200">/</span>
              <button
                onClick={() => handleSortChange('oldest')}
                className={`text-[10px] uppercase tracking-widest transition-colors ${sortOrder === 'oldest' ? 'font-bold text-stone-800 underline underline-offset-4' : 'text-stone-400 hover:text-stone-600'}`}
              >
                {dictionary.oldest}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processedArtworks.map((artwork, index) => (
            <ArtworkCard 
              key={`${artwork.id}-${index}`} 
              artwork={artwork} 
              locale={locale} 
              priority={index < 4}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

