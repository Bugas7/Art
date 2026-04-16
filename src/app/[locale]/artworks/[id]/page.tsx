import { notFound } from 'next/navigation';
import Link from 'next/link';
import { artworks } from '@/data/artworks';
import ImageGallery from '@/components/ImageGallery';
import RoomPreview from '@/components/RoomPreview';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

interface Params {
  id: string;
  locale: Locale;
}

export function generateStaticParams() {
  const params: Params[] = [];
  artworks.forEach((artwork) => {
    ['en', 'de', 'uk', 'ru'].forEach((locale) => {
      params.push({ id: artwork.id, locale: locale as Locale });
    });
  });
  return params;
}

export default async function ArtworkPage({ params }: { params: Promise<Params> }) {
  const { id, locale } = await params;
  const artwork = artworks.find((a) => a.id === id);

  if (!artwork) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  
  // Ensure the primary image from the home page is ALWAYS first
  const galleryImages = [
    artwork.image,
    ...(artwork.images || []).filter(img => img !== artwork.image)
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <Link
        href={`/${locale}`}
        className="mb-10 inline-block text-sm uppercase tracking-widest text-stone-400 transition-colors hover:text-stone-700"
      >
        ← {dictionary.common.backToGallery}
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <ImageGallery key={artwork.id} images={galleryImages} title={artwork.title[locale]} />

        {/* Details */}
        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-4xl font-light text-stone-800 md:text-5xl">
            {artwork.title[locale]}
          </h1>
          {locale !== 'en' && (
            <p className="mt-2 text-xl font-light text-stone-400">
              {artwork.title.en}
            </p>
          )}

          <div className="mt-8 space-y-3 text-stone-600">
            <p>
              <span className="text-stone-400">{dictionary.common.medium}:</span> {artwork.medium[locale]}
            </p>
            <p>
              <span className="text-stone-400">{dictionary.common.year}:</span> {artwork.year}
            </p>
            <p>
              <span className="text-stone-400">{dictionary.common.dimensions}:</span> {artwork.width}{' '}
              × {artwork.height} {artwork.unit}
            </p>
            <p>
              <span className="text-stone-400">{dictionary.common.category}:</span>{' '}
              {artwork.category[locale]}
            </p>
          </div>

          <div className="mt-10 max-w-xl">
            <p className="text-lg font-light leading-relaxed text-stone-600">
              {artwork.description[locale]}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4">
            <Link
              href={`/${locale}/contact`}
              className="flex w-full items-center justify-center rounded-full bg-stone-800 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-stone-700 active:scale-[0.98]"
            >
              {locale === 'ru' ? 'Связаться по этой работе' : 
               locale === 'uk' ? 'Зв\'язатися щодо цієї роботи' :
               locale === 'de' ? 'Kontakt bezüglich dieses Werks' :
               'Contact regarding this artwork'}
            </Link>
            
            <RoomPreview 
              image={artwork.image} 
              title={artwork.title[locale]} 
              dictionary={dictionary} 
              artworkWidth={artwork.width}
              artworkHeight={artwork.height}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

