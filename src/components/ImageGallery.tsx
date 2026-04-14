'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100 ring-1 ring-stone-200 md:aspect-[4/5]">
        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-contain transition-opacity duration-500"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`relative h-20 w-20 overflow-hidden border-2 transition-all ${
                activeImage === img ? 'border-stone-800 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <Image
                src={img}
                alt={`${title} - view ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
