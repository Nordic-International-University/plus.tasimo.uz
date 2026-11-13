import type { PlusDoc, Text } from './types';

const t = (en: string, ru: string): Text => ({ en, ru });

/** Galereya va bo'limlardagi standart rasmlar (public/art) — admin o'z rasmlariga almashtiradi */
const art = (name: string) => `/art/${name}.svg`;

/**
 * Standart landing (backend'da hali e'lon qilinmagan bo'lsa ko'rsatiladi va muharrir shundan boshlaydi).
 *
 * Mazmun — TASIMO Plus Brand Book (V1.0, 16.10.2026) bo'yicha:
 *  - pozitsiya: «TASIMO Plus — boshlang'ich sinf o'quvchilari uchun TASIMO brendi ostidagi matematika olimpiadasi»;
 *  - dekriptor EN/RU, shior «Katta kashfiyotlar kichik qadamlardan boshlanadi», kampaniya iborasi «O'yla. Izla. Kashf et.»;
 *  - uch auditoriya (o'quvchi, ota-ona, ustoz va maktab), qadriyatlar (qiziquvchanlik, tushunarlilik, adolat, qo'llab-quvvatlash);
 *  - tasdiqlanmagan va'da yo'q («g'alaba kafolatlangan», «har bolaga medal», «xalqaro sertifikat»), Plus asosiy TASIMO uchun
 *    majburiy bosqich sifatida ko'rsatilmaydi; sinflar, sana, shartlar — faqat amaldagi nizomdan (matnda raqam yo'q).
 * Format (tashkilotchi): yiliga ikki mavsum (qishki va yozgi); har mavsum — 1) onlayn saralash, 2) Toshkentda offline final.
 * Havola `cta:register` — «Umumiy → Tugmalar» dagi manzil (bosish kuzatiladi).
 */
export function createDefaultDoc(accountUrl = 'https://account.tasimo.uz'): PlusDoc {
  return {
    v: 1,
    header: {
      nav: [
        { id: 'n-about', label: t('About', 'О проекте'), href: '#about' },
        { id: 'n-audience', label: t('For whom', 'Для кого'), href: '#audience' },
        { id: 'n-seasons', label: t('Seasons', 'Сезоны'), href: '#seasons' },
        { id: 'n-how', label: t('How it works', 'Как участвовать'), href: '#how' },
        { id: 'n-faq', label: t('FAQ', 'Вопросы'), href: '#faq' },
      ],
      cta: 'register',
      secondaryCta: 'login',
      logoId: 'official',
    },
    ctas: {
      register: { label: t('Register', 'Зарегистрироваться'), href: `${accountUrl}/register?mode=global` },
      participate: { label: t('Join the season', 'Участвовать в сезоне'), href: `${accountUrl}/account/olympiads` },
      login: { label: t('Sign in', 'Войти'), href: `${accountUrl}/login` },
    },
    sections: [
      {
        id: 'hero',
        type: 'hero',
        variant: 'orbit',
        hidden: false,
        anchor: 'top',
        bg: 'paper',
        eyebrow: t('Mathematics Olympiad for Primary School Students', 'Математическая олимпиада для учащихся начальных классов'),
        title: t('Big discoveries\nbegin with small steps.', 'Большие открытия\nначинаются с маленьких шагов.'),
        subtitle: t(
          'TASIMO Plus is a mathematics olympiad for primary school students under the TASIMO brand. Twice a year — in winter and in summer — children take the qualifying round online from home, and the strongest participants come to Tashkent for the final.',
          'TASIMO Plus — математическая олимпиада для учащихся начальных классов под брендом TASIMO. Дважды в год — зимой и летом — дети проходят онлайн-отбор из дома, а сильнейшие участники приезжают в Ташкент на финал.',
        ),
        ctas: ['register', 'participate'],
        items: [
          {
            id: 'h1',
            value: '01',
            title: t('Online qualifying round', 'Онлайн-отбор'),
            text: t('The problems are solved from home on the olympiad day.', 'Задачи решаются из дома в день олимпиады.'),
          },
          {
            id: 'h2',
            value: '02',
            title: t('The final in Tashkent', 'Финал в Ташкенте'),
            text: t('The strongest participants are invited to the in-person final.', 'Сильнейших участников приглашают на очный финал.'),
          },
          {
            id: 'h3',
            value: '×2',
            title: t('Winter and summer', 'Зима и лето'),
            text: t('Two seasons every year — join one or both.', 'Два сезона в году — в одном или в обоих.'),
          },
        ],
      },
      {
        id: 'about',
        type: 'about',
        variant: 'split',
        hidden: false,
        anchor: 'about',
        bg: 'plain',
        eyebrow: t('What is TASIMO Plus', 'Что такое TASIMO Plus'),
        title: t('A familiar name, a new beginning', 'Знакомое имя — новое начало'),
        body: t(
          "Let a child's first mathematical competition become a discovery of their own abilities. TASIMO Plus builds on the familiar TASIMO name; the PLUS sign marks a separate direction for primary school students.\n\nEvery season has two stages: an online qualifying round taken from home, and the final held in person in Tashkent. The exact grades, dates and conditions are set in the official regulations of each season.",
          'Пусть первое математическое соревнование ребёнка станет открытием собственных возможностей. TASIMO Plus опирается на знакомое имя TASIMO, а знак PLUS обозначает отдельное направление для учащихся начальных классов.\n\nКаждый сезон проходит в два этапа: онлайн-отбор из дома и очный финал в Ташкенте. Точные классы, даты и условия определяются официальным положением каждого сезона.',
        ),
        image: art('registan'),
        items: [
          {
            id: 'a1',
            icon: 'lightbulb',
            title: t('Curiosity', 'Любознательность'),
            text: t('We encourage questions and the search for a solution — “Why?” and “How?” are welcome.', 'Поощряем вопросы и поиск решения — «Почему?» и «Как?» здесь уместны.'),
          },
          {
            id: 'a2',
            icon: 'book',
            title: t('Clarity', 'Понятность'),
            text: t('Age-appropriate language, short instructions and clear information.', 'Язык по возрасту, короткие инструкции и понятная информация.'),
          },
          {
            id: 'a3',
            icon: 'shield',
            title: t('Fairness', 'Честность'),
            text: t('Evaluation and participation conditions follow the published regulations.', 'Оценивание и условия участия соответствуют опубликованному положению.'),
          },
          {
            id: 'a4',
            icon: 'star',
            title: t('Support', 'Поддержка'),
            text: t("We value every child's effort and search — no comparison, no pressure.", 'Ценим старание и поиск каждого ребёнка — без сравнений и давления.'),
          },
        ],
      },
      {
        id: 'audience',
        type: 'features',
        variant: 'cards',
        hidden: false,
        anchor: 'audience',
        bg: 'paper',
        columns: 3,
        eyebrow: t('For children, parents and teachers', 'Детям, родителям и учителям'),
        title: t('Three audiences. The same clarity.', 'Три аудитории. Одинаковая ясность.'),
        subtitle: t('Every message is written with its reader in mind.', 'Каждое сообщение написано с учётом того, кто его читает.'),
        items: [
          {
            id: 'u1',
            icon: 'sparkles',
            shape: 'plate',
            accent: 'teal',
            title: t('For pupils', 'Ученикам'),
            text: t(
              'One problem — one new discovery. An interesting challenge where you can try your strength and feel free. Find the solution!',
              'Одна задача — одно новое открытие. Интересное испытание, где можно проверить свои силы и чувствовать себя свободно. Найди решение!',
            ),
          },
          {
            id: 'u2',
            icon: 'users',
            shape: 'plate',
            accent: 'teal',
            title: t('For parents', 'Родителям'),
            text: t(
              'Grades, conditions and the whole process are explained clearly. Before taking part, review the grades and the conditions.',
              'Классы, условия и весь процесс объяснены понятно. Перед участием ознакомьтесь с классами и условиями.',
            ),
          },
          {
            id: 'u3',
            icon: 'book',
            shape: 'plate',
            accent: 'teal',
            title: t('For teachers and schools', 'Учителям и школам'),
            text: t(
              'Ready information for organising participation. Share the participation guide with your students.',
              'Готовая информация для организации участия. Поделитесь с учениками инструкцией по участию.',
            ),
          },
        ],
      },
      {
        id: 'why',
        type: 'features',
        variant: 'cards',
        hidden: false,
        anchor: 'why',
        bg: 'plain',
        columns: 3,
        eyebrow: t('Why TASIMO Plus', 'Почему TASIMO Plus'),
        title: t('Start from home, finish in Tashkent', 'Начните из дома — финишируйте в Ташкенте'),
        subtitle: t('Trustworthy, interesting and sincere — and organised step by step.', 'Надёжно, интересно и искренне — и всё по порядку.'),
        items: [
          { id: 'w1', icon: 'laptop', shape: 'rounded', title: t('Qualify from anywhere', 'Отбор — откуда угодно'), text: t('The first stage is online: a computer and an internet connection are enough.', 'Первый этап — онлайн: достаточно компьютера и интернета.') },
          { id: 'w2', icon: 'map', shape: 'rounded', title: t('A final in Tashkent', 'Финал в Ташкенте'), text: t('The second stage is held in person: the best participants of the qualifying round meet in Tashkent.', 'Второй этап проходит очно: лучшие участники отбора встречаются в Ташкенте.') },
          { id: 'w3', icon: 'calendar', shape: 'rounded', title: t('Two seasons a year', 'Два сезона в году'), text: t('Winter and summer — take part in one season or in both.', 'Зимний и летний — участвуйте в одном сезоне или в обоих.') },
          { id: 'w4', icon: 'languages', shape: 'rounded', title: t('English or Russian', 'Английский или русский'), text: t('Choose the language the child thinks in best.', 'Выберите язык, на котором ребёнку удобнее думать.') },
          { id: 'w5', icon: 'shield', shape: 'rounded', title: t('A trusted organiser', 'Надёжный организатор'), text: t('Run by the team behind the Tashkent International Mathematics Olympiad.', 'Проводит команда Ташкентской международной математической олимпиады.') },
          { id: 'w6', icon: 'users', shape: 'rounded', title: t('One account for everything', 'Один кабинет для всего'), text: t('Registration, payment, both stages and results — in the TASIMO account.', 'Регистрация, оплата, оба этапа и результаты — в кабинете TASIMO.') },
        ],
      },
      {
        id: 'seasons',
        type: 'seasons',
        variant: 'route',
        hidden: false,
        anchor: 'seasons',
        bg: 'night',
        eyebrow: t('Two seasons a year', 'Два сезона в году'),
        title: t('Winter and summer — two chances every year', 'Зима и лето — два шанса каждый год'),
        subtitle: t(
          'Each season follows the same route: an online qualifying round first, then the final in Tashkent.',
          'Каждый сезон проходит по одному маршруту: сначала онлайн-отбор, затем финал в Ташкенте.',
        ),
        items: [
          {
            id: 's1',
            label: t('Season I', 'Сезон I'),
            title: t('Winter season', 'Зимний сезон'),
            text: t('Stage 1 — online qualifying round.\nStage 2 — the final in Tashkent.', 'Этап 1 — онлайн-отбор.\nЭтап 2 — финал в Ташкенте.'),
            icon: 'snowflake',
          },
          {
            id: 's2',
            label: t('Season II', 'Сезон II'),
            title: t('Summer season', 'Летний сезон'),
            text: t('Stage 1 — online qualifying round.\nStage 2 — the final in Tashkent.', 'Этап 1 — онлайн-отбор.\nЭтап 2 — финал в Ташкенте.'),
            icon: 'sun',
          },
        ],
      },
      {
        id: 'how',
        type: 'steps',
        variant: 'path',
        hidden: false,
        anchor: 'how',
        bg: 'plain',
        eyebrow: t('How it works', 'Как участвовать'),
        title: t('From registration to the final in Tashkent', 'От регистрации до финала в Ташкенте'),
        ctas: ['register'],
        items: [
          { id: 'p1', icon: 'users', title: t('Create an account', 'Создайте аккаунт'), text: t('Registration on the TASIMO platform is free and quick.', 'Регистрация на платформе TASIMO бесплатная и быстрая.') },
          { id: 'p2', icon: 'calendar', title: t('Join a season', 'Запишитесь на сезон'), text: t('Choose the winter or summer season, review the conditions and pay the participation fee online.', 'Выберите зимний или летний сезон, ознакомьтесь с условиями и оплатите участие онлайн.') },
          { id: 'p3', icon: 'laptop', title: t('Stage 1: qualify online', 'Этап 1: онлайн-отбор'), text: t('On the olympiad day, log in and solve the problems from home.', 'В день олимпиады войдите в кабинет и решайте задачи из дома.') },
          { id: 'p4', icon: 'plane', title: t('Stage 2: the final in Tashkent', 'Этап 2: финал в Ташкенте'), text: t('The strongest participants are invited to the in-person final in Tashkent.', 'Сильнейших участников приглашают на очный финал в Ташкенте.') },
        ],
      },
      {
        id: 'numbers',
        type: 'stats',
        variant: 'band',
        hidden: false,
        anchor: 'numbers',
        bg: 'paper',
        title: t('TASIMO Plus in numbers', 'TASIMO Plus в цифрах'),
        items: [
          { id: 'n1', value: '2', label: t('seasons a year — winter and summer', 'сезона в году — зимний и летний'), icon: 'calendar' },
          { id: 'n2', value: '2', label: t('stages in every season', 'этапа в каждом сезоне'), icon: 'target' },
          { id: 'n3', value: '1', label: t('final — in person, in Tashkent', 'финал — очно, в Ташкенте'), icon: 'plane' },
          { id: 'n4', value: '2', label: t('languages — English and Russian', 'языка — английский и русский'), icon: 'languages' },
        ],
      },
      {
        id: 'gallery',
        type: 'gallery',
        variant: 'postcards',
        hidden: false,
        anchor: 'gallery',
        bg: 'plain',
        layout: 'bento',
        eyebrow: t('The destination', 'Пункт назначения'),
        title: t('Where algebra was born — and where the final takes place', 'Там, где родилась алгебра, — и где проходит финал'),
        subtitle: t(
          'Uzbekistan is the land of al-Khwarizmi and Ulugh Beg — a fitting home for a mathematics final.',
          'Узбекистан — земля аль-Хорезми и Улугбека, достойное место для математического финала.',
        ),
        items: [
          { id: 'g1', image: art('tashkent'), title: t('Tashkent — the city of the final', 'Ташкент — город финала'), span: 2, tall: true, shape: 'plate' },
          { id: 'g2', image: art('observatory'), title: t("Ulugh Beg's sextant", 'Секстант Улугбека'), tall: true, shape: 'plate' },
          { id: 'g3', image: art('registan'), title: t('Registan, Samarkand', 'Регистан, Самарканд'), shape: 'plate' },
          { id: 'g4', image: art('algebra'), title: t('Al-jabr — the birth of algebra', 'Аль-джабр — рождение алгебры'), span: 2, shape: 'plate' },
          { id: 'g5', image: art('bukhara'), title: t('Old Bukhara', 'Старая Бухара'), tall: true, shape: 'plate' },
          { id: 'g6', image: art('khiva'), title: t('Itchan Kala, Khiva', 'Ичан-Кала, Хива'), span: 2, shape: 'plate' },
          { id: 'g7', image: art('mountains'), title: t('Chimgan mountains', 'Горы Чимган'), shape: 'plate' },
          { id: 'g8', image: art('caravan'), title: t('The Silk Road', 'Шёлковый путь'), span: 2, shape: 'plate' },
        ],
      },
      {
        id: 'video',
        type: 'video',
        variant: 'featured',
        hidden: false,
        anchor: 'video',
        bg: 'paper',
        eyebrow: t('Watch', 'Смотрите'),
        title: t('See what an olympiad round looks like', 'Посмотрите, как проходит тур олимпиады'),
        subtitle: t(
          'Stories, problem walkthroughs and highlights from TASIMO on our YouTube channel.',
          'Истории, разборы задач и лучшие моменты TASIMO на нашем YouTube-канале.',
        ),
        video: '',
        image: art('observatory'),
        items: [{ id: 'v1', title: t('Open the YouTube channel', 'Открыть YouTube-канал'), href: 'https://www.youtube.com/@tasimo_uz' }],
      },
      {
        id: 'faq',
        type: 'faq',
        variant: 'accordion',
        hidden: false,
        anchor: 'faq',
        bg: 'plain',
        eyebrow: t('Questions', 'Вопросы'),
        title: t('Frequently asked questions', 'Частые вопросы'),
        items: [
          {
            id: 'f1',
            title: t('Who can take part in TASIMO Plus?', 'Кто может участвовать в TASIMO Plus?'),
            text: t(
              'Primary school students. The exact grades and participation conditions are set in the official regulations of each season — please review them before registering.',
              'Учащиеся начальных классов. Точные классы и условия участия определяются официальным положением каждого сезона — ознакомьтесь с ним перед регистрацией.',
            ),
          },
          {
            id: 'f2',
            title: t('How often is the olympiad held?', 'Как часто проходит олимпиада?'),
            text: t('Twice a year: in a winter season and in a summer season. You can take part in one of them or in both.', 'Дважды в год: в зимнем и летнем сезонах. Можно участвовать в одном из них или в обоих.'),
          },
          {
            id: 'f3',
            title: t('How does a season work?', 'Как проходит сезон?'),
            text: t(
              'In two stages. Stage 1 is an online qualifying round taken from home. Stage 2 is the final, held in person in Tashkent.',
              'В два этапа. Этап 1 — онлайн-отбор, который проходят из дома. Этап 2 — финал, который проходит очно в Ташкенте.',
            ),
          },
          {
            id: 'f4',
            title: t('Who goes to the final?', 'Кто попадает в финал?'),
            text: t(
              'The strongest participants of the online qualifying round are invited to the final in Tashkent. The details are set in the regulations of each season.',
              'На финал в Ташкент приглашают сильнейших участников онлайн-отбора. Подробности определяются положением каждого сезона.',
            ),
          },
          {
            id: 'f5',
            title: t('Is TASIMO Plus a required stage of the main TASIMO olympiad?', 'Обязателен ли TASIMO Plus для участия в основной олимпиаде TASIMO?'),
            text: t(
              'No. TASIMO Plus is a separate direction for primary school students; taking part in it is not a required stage of the main TASIMO olympiad.',
              'Нет. TASIMO Plus — отдельное направление для учащихся начальных классов; участие в нём не является обязательным этапом основной олимпиады TASIMO.',
            ),
          },
          {
            id: 'f6',
            title: t('In which language are the problems?', 'На каком языке задачи?'),
            text: t('In English or Russian — you choose when you register.', 'На английском или русском — выбираете при регистрации.'),
          },
          {
            id: 'f7',
            title: t('How do I pay the participation fee?', 'Как оплатить участие?'),
            text: t('Online, by card, in the personal account after registering for a season.', 'Онлайн, картой, в личном кабинете после записи на сезон.'),
          },
          {
            id: 'f8',
            title: t('Where will we see the results?', 'Где мы увидим результаты?'),
            text: t('In the personal account on the TASIMO platform, as set out in the regulations.', 'В личном кабинете на платформе TASIMO — в порядке, установленном положением.'),
          },
        ],
      },
      {
        id: 'final-cta',
        type: 'cta',
        variant: 'boarding',
        hidden: false,
        anchor: 'join',
        bg: 'aurora',
        eyebrow: t('Think. Explore. Discover.', 'Думай. Ищи. Открывай.'),
        title: t('Next stop: the final in Tashkent', 'Следующая остановка — финал в Ташкенте'),
        subtitle: t(
          'Review the grades and conditions, create a free account and be ready when the next season opens.',
          'Ознакомьтесь с классами и условиями, создайте бесплатный аккаунт и будьте готовы к старту следующего сезона.',
        ),
        ctas: ['register', 'login'],
        items: [
          { id: 'c1', label: t('From', 'Откуда'), value: 'ONLINE', title: t('Qualifying round', 'Отборочный тур') },
          { id: 'c2', label: t('To', 'Куда'), value: 'TAS', title: t('The final in Tashkent', 'Финал в Ташкенте') },
          { id: 'c3', label: t('Seasons', 'Сезоны'), value: 'I · II', title: t('Winter and summer', 'Зима и лето') },
        ],
      },
    ],
    footer: {
      tagline: t(
        'TASIMO Plus — a mathematics olympiad for primary school students under the TASIMO brand: an online qualifying round and the final in Tashkent.',
        'TASIMO Plus — математическая олимпиада для учащихся начальных классов под брендом TASIMO: онлайн-отбор и финал в Ташкенте.',
      ),
      columns: [
        {
          id: 'fc1',
          title: t('Olympiad', 'Олимпиада'),
          links: [
            { id: 'l1', label: t('About TASIMO Plus', 'О TASIMO Plus'), href: '#about' },
            { id: 'l2', label: t('For whom', 'Для кого'), href: '#audience' },
            { id: 'l3', label: t('Seasons', 'Сезоны'), href: '#seasons' },
            { id: 'l4', label: t('How it works', 'Как участвовать'), href: '#how' },
            { id: 'l5', label: t('FAQ', 'Вопросы'), href: '#faq' },
          ],
        },
        {
          id: 'fc2',
          title: t('Participants', 'Участникам'),
          links: [
            { id: 'l6', label: t('Register', 'Регистрация'), href: 'cta:register' },
            { id: 'l7', label: t('Personal account', 'Личный кабинет'), href: 'cta:login' },
            { id: 'l8', label: t('TASIMO website', 'Сайт TASIMO'), href: 'https://tasimo.uz' },
          ],
        },
      ],
      contacts: [
        { id: 'ct1', icon: 'mail', label: t('info@tasimo.uz', 'info@tasimo.uz'), href: 'mailto:info@tasimo.uz' },
        { id: 'ct2', icon: 'pin', label: t('Tashkent, Uzbekistan', 'Ташкент, Узбекистан'), href: '' },
      ],
      socials: [
        { id: 'so1', network: 'instagram', href: 'https://www.instagram.com/tasimo_uz' },
        { id: 'so2', network: 'telegram', href: 'https://t.me/tasimo_uz' },
        { id: 'so3', network: 'facebook', href: 'https://www.facebook.com/tasimo.uz' },
        { id: 'so4', network: 'youtube', href: 'https://www.youtube.com/@tasimo_uz' },
      ],
      copyright: t('© TASIMO. All rights reserved.', '© TASIMO. Все права защищены.'),
      note: t('Think. Explore. Discover.', 'Думай. Ищи. Открывай.'),
    },
    seo: {
      title: t('TASIMO Plus — Mathematics Olympiad for Primary School Students', 'TASIMO Plus — математическая олимпиада для учащихся начальных классов'),
      description: t(
        'Winter and summer seasons: an online qualifying round from home and the final in Tashkent. Problems in English or Russian. Think. Explore. Discover.',
        'Зимний и летний сезоны: онлайн-отбор из дома и финал в Ташкенте. Задачи на английском или русском. Думай. Ищи. Открывай.',
      ),
      keywords: t(
        'math olympiad for primary school, primary school students, mathematics olympiad, TASIMO Plus, TASIMO, olympiad in Tashkent, online qualifying round',
        'олимпиада по математике для начальной школы, начальные классы, математическая олимпиада, TASIMO Plus, TASIMO, олимпиада в Ташкенте, онлайн-отбор',
      ),
      ogImage: '',
    },
  };
}
