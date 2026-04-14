export interface Translation {
  en: string;
  de: string;
  uk: string;
  ru: string;
}

export interface Artwork {
  id: string;
  title: Translation;
  medium: Translation;
  year: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
  description: Translation;
  image: string;
  images?: string[];
  category: Translation;
  price?: string;
  sold?: boolean;
}

