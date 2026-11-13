import type { Background, Box, Section, SectionType, Text } from './types';

const t = (en: string, ru: string): Text => ({ en, ru });

export function newId(prefix = 'x'): string {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export interface VariantMeta {
  key: string;
  label: string;
}

export interface SectionMeta {
  type: SectionType;
  /** Muharrirdagi nom (o'zbekcha) */
  label: string;
  hint: string;
  variants: VariantMeta[];
  bg: Background;
  /** Qutilar qanday nomlanadi («+ Karta») */
  boxLabel: string;
  /** Qaysi quti maydonlari muharrir panelida ko'rinadi */
  boxFields: ('icon' | 'image' | 'shape' | 'span' | 'tall' | 'accent' | 'href' | 'value')[];
  sectionFields: ('image' | 'video' | 'ctas' | 'layout' | 'columns' | 'countdownTo')[];
  sample: () => Pick<Section, 'eyebrow' | 'title' | 'subtitle' | 'body' | 'items' | 'ctas' | 'layout' | 'columns' | 'image' | 'video'>;
  newBox: () => Box;
}

const card = (en: string, ru: string, icon: Box['icon'] = 'sparkles'): Box => ({
  id: newId('b'),
  icon,
  title: t(en, ru),
  text: t('Short description — click to edit.', 'Короткое описание — нажмите, чтобы изменить.'),
  shape: 'rounded',
});

export const SECTION_META: Record<SectionType, SectionMeta> = {
  hero: {
    type: 'hero',
    label: 'Bosh ekran (hero)',
    hint: 'Katta sarlavha, tugmalar va bosqichlar marshruti',
    variants: [
      { key: 'orbit', label: 'Matn + marshrut kartasi' },
      { key: 'split', label: 'Matn + rasm' },
      { key: 'poster', label: 'To‘liq fon rasmi' },
    ],
    bg: 'paper',
    boxLabel: 'Bekat',
    boxFields: ['value'],
    sectionFields: ['image', 'ctas'],
    sample: () => ({
      eyebrow: t('New season', 'Новый сезон'),
      title: t('Your headline\ngoes here', 'Ваш заголовок\nздесь'),
      subtitle: t('A sentence that explains the offer.', 'Предложение, которое объясняет суть.'),
      ctas: ['register'],
      items: [
        { id: newId('b'), value: '01', title: t('Online qualifying round', 'Онлайн-отбор'), text: t('Short description.', 'Короткое описание.') },
        { id: newId('b'), value: '02', title: t('The final in Tashkent', 'Финал в Ташкенте'), text: t('Short description.', 'Короткое описание.') },
      ],
    }),
    newBox: () => ({ id: newId('b'), value: '03', title: t('Next stop', 'Следующая остановка'), text: t('Short description.', 'Короткое описание.') }),
  },
  about: {
    type: 'about',
    label: 'Loyiha haqida',
    hint: 'Rasm, matn va afzalliklar ro‘yxati',
    variants: [
      { key: 'split', label: 'Rasm chapda' },
      { key: 'centered', label: 'Markazda' },
    ],
    bg: 'plain',
    boxLabel: 'Afzallik',
    boxFields: ['icon', 'accent', 'shape'],
    sectionFields: ['image', 'ctas'],
    sample: () => ({
      eyebrow: t('About', 'О проекте'),
      title: t('Tell your story', 'Расскажите свою историю'),
      body: t('A paragraph about the project.\n\nAnother paragraph.', 'Абзац о проекте.\n\nЕщё один абзац.'),
      image: '/art/registan.svg',
      items: [card('Point one', 'Пункт один', 'trophy'), card('Point two', 'Пункт два', 'users')],
    }),
    newBox: () => card('New point', 'Новый пункт'),
  },
  features: {
    type: 'features',
    label: 'Afzalliklar (kartalar)',
    hint: 'Ikonkali kartalar to‘ri',
    variants: [
      { key: 'cards', label: 'Kartalar' },
      { key: 'icons', label: 'Kartasiz (chiziqlar)' },
      { key: 'bento', label: 'Bento (har xil o‘lcham)' },
    ],
    bg: 'paper',
    boxLabel: 'Karta',
    boxFields: ['icon', 'accent', 'shape', 'span', 'image'],
    sectionFields: ['columns', 'ctas'],
    sample: () => ({
      eyebrow: t('Why us', 'Почему мы'),
      title: t('Reasons to join', 'Причины присоединиться'),
      columns: 3,
      items: [card('First reason', 'Первая причина', 'globe'), card('Second reason', 'Вторая причина', 'star'), card('Third reason', 'Третья причина', 'rocket')],
    }),
    newBox: () => card('New card', 'Новая карточка'),
  },
  seasons: {
    type: 'seasons',
    label: 'Mavsumlar',
    hint: 'Qishki va yozgi mavsum — katta kartalar yoki rasmli kartalar',
    variants: [
      { key: 'route', label: 'Katta kartalar' },
      { key: 'cards', label: 'Rasmli kartalar' },
    ],
    bg: 'night',
    boxLabel: 'Mavsum',
    boxFields: ['icon', 'accent', 'image'],
    sectionFields: ['ctas'],
    sample: () => ({
      eyebrow: t('Seasons', 'Сезоны'),
      title: t('Two seasons a year', 'Два сезона в году'),
      items: [
        {
          id: newId('b'),
          label: t('Season I', 'Сезон I'),
          title: t('Winter season', 'Зимний сезон'),
          text: t('Stage 1 — online qualifying round.\nStage 2 — the final in Tashkent.', 'Этап 1 — онлайн-отбор.\nЭтап 2 — финал в Ташкенте.'),
          icon: 'snowflake',
        },
        {
          id: newId('b'),
          label: t('Season II', 'Сезон II'),
          title: t('Summer season', 'Летний сезон'),
          text: t('Stage 1 — online qualifying round.\nStage 2 — the final in Tashkent.', 'Этап 1 — онлайн-отбор.\nЭтап 2 — финал в Ташкенте.'),
          icon: 'sun',
        },
      ],
    }),
    newBox: () => ({ id: newId('b'), label: t('Season', 'Сезон'), title: t('Season name', 'Название сезона'), text: t('Stage 1 — …\nStage 2 — …', 'Этап 1 — …\nЭтап 2 — …'), icon: 'calendar' }),
  },
  steps: {
    type: 'steps',
    label: 'Qadamlar',
    hint: '«Qanday ishtirok etiladi» — ketma-ket qadamlar',
    variants: [
      { key: 'path', label: 'Bitta chiziq ustida' },
      { key: 'numbered', label: 'Raqamli ro‘yxat' },
    ],
    bg: 'plain',
    boxLabel: 'Qadam',
    boxFields: ['icon', 'accent'],
    sectionFields: ['ctas'],
    sample: () => ({
      eyebrow: t('How it works', 'Как это работает'),
      title: t('Three simple steps', 'Три простых шага'),
      ctas: ['register'],
      items: [card('Step one', 'Шаг один', 'users'), card('Step two', 'Шаг два', 'laptop'), card('Step three', 'Шаг три', 'target')],
    }),
    newBox: () => card('New step', 'Новый шаг', 'target'),
  },
  stats: {
    type: 'stats',
    label: 'Raqamlar',
    hint: 'Katta raqamlar (sanab chiqadi)',
    variants: [
      { key: 'band', label: 'Qator' },
      { key: 'cards', label: 'Kartalar' },
    ],
    bg: 'paper',
    boxLabel: 'Raqam',
    boxFields: ['value', 'icon', 'accent'],
    sectionFields: [],
    sample: () => ({
      title: t('In numbers', 'В цифрах'),
      items: [
        { id: newId('b'), value: '2', label: t('seasons a year', 'сезона в году'), icon: 'calendar' },
        { id: newId('b'), value: '2', label: t('stages in every season', 'этапа в каждом сезоне'), icon: 'target' },
        { id: newId('b'), value: '1', label: t('final in Tashkent', 'финал в Ташкенте'), icon: 'plane' },
      ],
    }),
    newBox: () => ({ id: newId('b'), value: '10', label: t('label', 'подпись'), icon: 'chart' }),
  },
  gallery: {
    type: 'gallery',
    label: 'Galereya',
    hint: '8–10 ta rasm: bento, masonry, to‘r yoki karusel',
    variants: [
      { key: 'postcards', label: 'Pochta otkritkalari' },
      { key: 'clean', label: 'Oddiy (izoh rasm ustida)' },
    ],
    bg: 'plain',
    boxLabel: 'Rasm',
    boxFields: ['image', 'shape', 'span', 'tall'],
    sectionFields: ['layout'],
    sample: () => ({
      eyebrow: t('Gallery', 'Галерея'),
      title: t('Moments', 'Моменты'),
      layout: 'bento',
      items: ['registan', 'khiva', 'bukhara', 'observatory', 'caravan', 'tashkent', 'mountains', 'algebra'].map((name, i) => ({
        id: newId('b'),
        image: `/art/${name}.svg`,
        title: t('Caption', 'Подпись'),
        shape: 'rounded' as const,
        span: i === 0 || i === 5 ? (2 as const) : (1 as const),
        tall: i === 0,
      })),
    }),
    newBox: () => ({ id: newId('b'), image: '', title: t('Caption', 'Подпись'), shape: 'rounded' }),
  },
  video: {
    type: 'video',
    label: 'Video (YouTube)',
    hint: 'YouTube havolasi — sahifani sekinlashtirmaydigan pleyer',
    variants: [
      { key: 'featured', label: 'Katta pleyer' },
      { key: 'split', label: 'Matn + pleyer' },
    ],
    bg: 'paper',
    boxLabel: 'Havola',
    boxFields: ['href'],
    sectionFields: ['video', 'image', 'ctas'],
    sample: () => ({
      eyebrow: t('Watch', 'Смотрите'),
      title: t('Video title', 'Название видео'),
      video: '',
      image: '/art/observatory.svg',
      items: [{ id: newId('b'), title: t('Open the YouTube channel', 'Открыть YouTube-канал'), href: 'https://www.youtube.com/@tasimo_uz' }],
    }),
    newBox: () => ({ id: newId('b'), title: t('Link', 'Ссылка'), href: '' }),
  },
  testimonials: {
    type: 'testimonials',
    label: 'Fikrlar / mukofotlar',
    hint: 'Ishtirokchilar fikri yoki mukofotlar',
    variants: [
      { key: 'quotes', label: 'Fikrlar' },
      { key: 'prizes', label: 'Mukofotlar (shohsupa)' },
    ],
    bg: 'paper',
    boxLabel: 'Fikr',
    boxFields: ['image', 'icon', 'accent', 'value'],
    sectionFields: ['ctas'],
    sample: () => ({
      eyebrow: t('Voices', 'Отзывы'),
      title: t('What participants say', 'Что говорят участники'),
      items: [
        { id: newId('b'), text: t('A short quote from a participant.', 'Короткая цитата участника.'), title: t('Name Surname', 'Имя Фамилия'), label: t('Country · grade', 'Страна · класс') },
        { id: newId('b'), text: t('Another quote.', 'Ещё одна цитата.'), title: t('Name Surname', 'Имя Фамилия'), label: t('Country · grade', 'Страна · класс') },
      ],
    }),
    newBox: () => ({ id: newId('b'), text: t('Quote', 'Цитата'), title: t('Name', 'Имя'), label: t('Country', 'Страна') }),
  },
  faq: {
    type: 'faq',
    label: 'Savol-javob (FAQ)',
    hint: 'Ochiladigan savollar — Google ham ko‘radi',
    variants: [
      { key: 'accordion', label: 'Markazda' },
      { key: 'two-column', label: 'Ikki ustun' },
    ],
    bg: 'plain',
    boxLabel: 'Savol',
    boxFields: ['accent'],
    sectionFields: ['ctas'],
    sample: () => ({
      eyebrow: t('Questions', 'Вопросы'),
      title: t('Frequently asked questions', 'Частые вопросы'),
      items: [{ id: newId('b'), title: t('Question?', 'Вопрос?'), text: t('Answer.', 'Ответ.') }],
    }),
    newBox: () => ({ id: newId('b'), title: t('New question?', 'Новый вопрос?'), text: t('Answer.', 'Ответ.') }),
  },
  cta: {
    type: 'cta',
    label: 'Chaqiriq (CTA)',
    hint: 'Bort-talon yoki banner, ixtiyoriy taymer',
    variants: [
      { key: 'boarding', label: 'Bort-talon' },
      { key: 'banner', label: 'Banner' },
    ],
    bg: 'aurora',
    boxLabel: 'Maydon',
    boxFields: ['value'],
    sectionFields: ['ctas', 'countdownTo'],
    sample: () => ({
      eyebrow: t('Join now', 'Присоединяйтесь'),
      title: t('Ready to start?', 'Готовы начать?'),
      subtitle: t('One sentence that motivates.', 'Одно мотивирующее предложение.'),
      ctas: ['register'],
      items: [
        { id: newId('b'), label: t('From', 'Откуда'), value: 'ONLINE', title: t('Qualifying round', 'Отборочный тур') },
        { id: newId('b'), label: t('To', 'Куда'), value: 'TAS', title: t('The final in Tashkent', 'Финал в Ташкенте') },
      ],
    }),
    newBox: () => ({ id: newId('b'), label: t('Field', 'Поле'), value: '—', title: t('Note', 'Примечание') }),
  },
  richtext: {
    type: 'richtext',
    label: 'Matn',
    hint: 'Sarlavha va erkin matn',
    variants: [
      { key: 'article', label: 'Markazda' },
      { key: 'aside', label: 'Sarlavha chapda' },
    ],
    bg: 'plain',
    boxLabel: '',
    boxFields: [],
    sectionFields: ['ctas'],
    sample: () => ({
      title: t('Section title', 'Заголовок раздела'),
      body: t('Write your text here.\n\nUse an empty line for a new paragraph.', 'Напишите текст здесь.\n\nПустая строка — новый абзац.'),
      items: [],
    }),
    newBox: () => ({ id: newId('b') }),
  },
  logos: {
    type: 'logos',
    label: 'Hamkorlar logotiplari',
    hint: 'Oqib turadigan qator yoki to‘r',
    variants: [
      { key: 'marquee', label: 'Oqib turadigan qator' },
      { key: 'grid', label: 'To‘r' },
    ],
    bg: 'plain',
    boxLabel: 'Logotip',
    boxFields: ['image', 'href'],
    sectionFields: [],
    sample: () => ({
      title: t('Partners', 'Партнёры'),
      items: [1, 2, 3, 4].map((n) => ({ id: newId('b'), title: t(`Partner ${n}`, `Партнёр ${n}`), image: '' })),
    }),
    newBox: () => ({ id: newId('b'), title: t('Partner', 'Партнёр'), image: '' }),
  },
};

/** Yangi bo'lim (presetdan) */
export function createSection(type: SectionType, variant?: string): Section {
  const meta = SECTION_META[type];
  const sample = meta.sample();
  const id = newId(type.slice(0, 3));
  return {
    id,
    type,
    variant: variant ?? meta.variants[0]?.key ?? '',
    hidden: false,
    anchor: '',
    bg: meta.bg,
    ...sample,
    items: sample.items ?? [],
  };
}
