import type { Locale } from './doc/types';

/** Interfeys matnlari (kontent emas — kontent muharrirda). Ikki til */
const STRINGS = {
  en: {
    skip: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    language: 'Language',
    playVideo: 'Play video',
    watchOnYoutube: 'Watch on YouTube',
    days: 'days',
    hours: 'hours',
    minutes: 'min',
    seconds: 'sec',
    contacts: 'Contacts',
    follow: 'Follow us',
    backToTop: 'Back to top',
    gallery: 'Gallery',
    prev: 'Previous',
    next: 'Next',
    notFoundTitle: 'This page has flown away',
    notFoundText: 'The page you are looking for does not exist. Let’s get you back on the route.',
    home: 'Back to TASIMO Plus',
    boardingPass: 'Boarding pass',
  },
  ru: {
    skip: 'Перейти к содержимому',
    menu: 'Меню',
    close: 'Закрыть',
    language: 'Язык',
    playVideo: 'Смотреть видео',
    watchOnYoutube: 'Смотреть на YouTube',
    days: 'дней',
    hours: 'часов',
    minutes: 'мин',
    seconds: 'сек',
    contacts: 'Контакты',
    follow: 'Мы в соцсетях',
    backToTop: 'Наверх',
    gallery: 'Галерея',
    prev: 'Назад',
    next: 'Вперёд',
    notFoundTitle: 'Эта страница улетела',
    notFoundText: 'Страница не найдена. Давайте вернёмся на маршрут.',
    home: 'На главную TASIMO Plus',
    boardingPass: 'Посадочный талон',
  },
} satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof STRINGS)['en'];

export function ui(locale: Locale, key: UiKey): string {
  return STRINGS[locale][key];
}
