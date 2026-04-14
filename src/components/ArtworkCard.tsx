import Image from 'next/image';
import Link from 'next/link';
import type { Artwork } from '@/types/artwork';
import { type Locale } from '@/i18n/config';

interface ArtworkCardProps {
  artwork: Artwork;
  locale: Locale;
}

export default function ArtworkCard({ artwork, locale }: ArtworkCardProps) {
  return (
    <Link
      href={`/${locale}/artworks/${artwork.id}`}
      className="group block overflow-hidden bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        <Image
          src={artwork.image}
          alt={artwork.title[locale]}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="px-4 py-4">
        <h3 className="text-lg font-light text-stone-800 transition-colors group-hover:text-stone-600">
          {artwork.title[locale]}
        </h3>
        {locale !== 'en' && (
          <p className="mt-1 text-sm text-stone-400">{artwork.title.en}</p>
        )}
        <p className="mt-2 text-sm text-stone-500">
          {artwork.medium[locale]}, {artwork.year}
        </p>
      </div>
    </Link>
  );
}

