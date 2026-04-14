import Image from 'next/image';
import { artist } from '@/data/artist';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Photo */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 lg:col-span-1">
          <Image
            src={artist.photo}
            alt={artist.name[locale]}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
            priority
          />
        </div>

        {/* Bio */}
        <div className="lg:col-span-2">
          <h1 className="font-serif text-4xl font-light text-stone-800 md:text-5xl">
            {dictionary.about.title}
          </h1>

          <div className="mt-8 space-y-5 text-lg font-light leading-relaxed text-stone-600">
            <p>
              <strong className="font-medium text-stone-700">
                {artist.name[locale]} {locale !== 'en' && `(${artist.name.en})`}
              </strong>
            </p>
            <p className="text-base text-stone-500">
              {locale === 'ru' ? 'Род. 1977, Киев, Украина · С 2019 — Вена, Австрия' :
               locale === 'uk' ? 'Народилася 1977, Київ, Україна · З 2019 — Відень, Австрія' :
               locale === 'de' ? 'Geb. 1977, Kiew, Ukraine · Seit 2019 — Wien, Österreich' :
               'Born 1977, Kyiv, Ukraine · Since 2019 — Vienna, Austria'}
            </p>
            {artist.bio[locale].split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* Exhibitions */}
          <div className="mt-12">
            <h2 className="font-serif text-2xl font-light text-stone-800">
              {locale === 'ru' ? 'Выставки' : 
               locale === 'uk' ? 'Виставки' :
               locale === 'de' ? 'Ausstellungen' :
               'Exhibitions'}
            </h2>
            <div className="mt-6 space-y-6">
              {artist.exhibitions.map((ex, i) => (
                <div
                  key={i}
                  className="border-l-2 border-stone-300 pl-5"
                >
                  <p className="text-sm font-medium text-stone-400">
                    {ex.year}
                  </p>
                  <p className="mt-1 text-lg font-light text-stone-700">
                    {ex.title[locale]}
                  </p>
                  <p className="mt-1 text-stone-500">{ex.description[locale]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="mt-12 flex gap-6">
            <a
              href={artist.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm uppercase tracking-widest text-stone-400 underline underline-offset-4 transition-colors hover:text-stone-700"
            >
              Instagram
            </a>
            <a
              href={artist.singulart}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm uppercase tracking-widest text-stone-400 underline underline-offset-4 transition-colors hover:text-stone-700"
            >
              Singulart
            </a>
          </div>

          <div className="mt-8 rounded-lg bg-amber-50 p-5 text-stone-600">
            <p className="font-medium text-amber-800">
              {locale === 'ru' ? 'Работы на заказ' :
               locale === 'uk' ? 'Роботи на замовлення' :
               locale === 'de' ? 'Auftragsarbeiten' :
               'Commissioned works'}
            </p>
            <p className="mt-1 text-sm">
              {locale === 'ru' ? 'Художница принимает заказы на создание картин по индивидуальному запросу. Свяжитесь для обсуждения деталей.' :
               locale === 'uk' ? 'Художниця приймає замовлення на створення картин за індивідуальним запитом. Зв\'яжіться для обговорення деталей.' :
               locale === 'de' ? 'Die Künstlerin nimmt Aufträge für Gemälde nach individuellen Wünschen entgegen. Kontaktieren Sie uns, um Details zu besprechen.' :
               'The artist accepts commissions for custom paintings. Contact us to discuss details.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

