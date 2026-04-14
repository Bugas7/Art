import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../globals.css';
import { locales, type Locale } from '@/i18n/config';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ирина Барабаш — Художница',
  description:
    'Персональный сайт художницы Ирины Барабаш. Галерея работ маслом на холсте — натюрморты, пейзажи, абстракции.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;

  return (
    <html lang={locale}>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased`}
      >
        <Header locale={locale} />
        <main className="min-h-screen">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}

