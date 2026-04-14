import { artist } from '@/data/artist';
import { type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  const contactContent = {
    ru: {
      title: 'Связаться',
      subtitle: 'Если вас заинтересовала одна из работ или вы хотите обсудить сотрудничество, напишите мне.',
      social: 'Социальные сети',
      write: 'Написать сообщение',
      placeholderName: 'Ваше имя',
      placeholderMessage: 'Расскажите, какая работа вас заинтересовала…'
    },
    uk: {
      title: 'Зв\'язатися',
      subtitle: 'Якщо вас зацікавила одна з робіт або ви хочете обговорити співпрацю, напишіть мені.',
      social: 'Соціальні мережі',
      write: 'Написати повідомлення',
      placeholderName: 'Ваше ім\'я',
      placeholderMessage: 'Розкажіть, яка робота вас зацікавила…'
    },
    de: {
      title: 'Kontakt',
      subtitle: 'Wenn Sie an einem der Werke interessiert sind oder eine Zusammenarbeit besprechen möchten, schreiben Sie mir bitte.',
      social: 'Soziale Netzwerke',
      write: 'Eine Nachricht schreiben',
      placeholderName: 'Ihr Name',
      placeholderMessage: 'Erzählen Sie mir, welches Werk Sie interessiert…'
    },
    en: {
      title: 'Contact',
      subtitle: 'If you are interested in one of the works or want to discuss cooperation, please write to me.',
      social: 'Social Media',
      write: 'Write a Message',
      placeholderName: 'Your Name',
      placeholderMessage: 'Tell me which work you are interested in…'
    }
  }[locale];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-light text-stone-800 md:text-5xl">
          {contactContent.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg font-light text-stone-500">
          {contactContent.subtitle}
        </p>
      </div>

      <div className="mt-12 rounded-lg bg-white p-8 shadow-sm md:p-12">
        <div className="space-y-6 text-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-stone-400">
              Email
            </p>
            <a
              href={`mailto:${artist.email}`}
              className="mt-1 text-xl font-light text-stone-700 underline underline-offset-4 transition-colors hover:text-stone-900"
            >
              {artist.email}
            </a>
          </div>

          <div className="border-t border-stone-100 pt-6">
            <p className="text-sm uppercase tracking-widest text-stone-400">
              {contactContent.social}
            </p>
            <div className="mt-3 flex justify-center gap-6">
              <a
                href={artist.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-light text-stone-600 underline underline-offset-4 transition-colors hover:text-stone-900"
              >
                Instagram
              </a>
              <a
                href={artist.singulart}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-light text-stone-600 underline underline-offset-4 transition-colors hover:text-stone-900"
              >
                Singulart
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-lg bg-white p-8 shadow-sm md:p-12">
        <h2 className="font-serif text-2xl font-light text-stone-800">
          {contactContent.write}
        </h2>
        <form className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-500"
            >
              {dictionary.contact.name}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none transition-colors focus:border-stone-400"
              placeholder={contactContent.placeholderName}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-500"
            >
              {dictionary.contact.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none transition-colors focus:border-stone-400"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-stone-500"
            >
              {dictionary.contact.message}
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="mt-1 w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none transition-colors focus:border-stone-400"
              placeholder={contactContent.placeholderMessage}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-stone-800 px-8 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-stone-600"
          >
            {dictionary.contact.send}
          </button>
        </form>
      </div>
    </div>
  );
}

