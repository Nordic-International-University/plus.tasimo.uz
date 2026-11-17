# plus.tasimo.uz

**TASIMO Plus** — boshlang'ich sinf o'quvchilari uchun TASIMO brendi ostidagi matematika olimpiadasining promo-landingi
(Brand Book va Brand Guidelines — `branding/*.pdf`, V1.0). Format: yiliga **ikki mavsum** (qishki va yozgi), har mavsum ikki
bosqich — 1) onlayn saralash, 2) Toshkentda offline final. Kontentda «100% onlayn» yoki «4 mavsum» yozilmasin.
Vazifasi: reklamadan (Instagram, Facebook, TikTok, Google) kelgan odamni lidga aylantirib, account.tasimo.uz ga
yuborish va har qadamni (tashrif → tugma → ro'yxatdan o'tish → olimpiada → to'lov) backend orqali dashboardda ko'rsatish.
Next.js 16.4 (App Router, `proxy.ts`), React 19, Tailwind 4, bun. Port: dev **3005**, prod **3101** (`bun start`, PM2
`plus.tasimo.uz`, `/var/www/tasimo-main/plus.tasimo.uz`). Tillar: **en** (asosiy) va **ru**.

## Qat'iy qoidalar

1. **Brauzer hech qachon api.tasimo.uz ga murojaat qilmaydi.** Landing ma'lumoti — server komponentda
   (`src/lib/api.server.ts`, tag `plus-landing`, ISR 300 s). Brauzerdan ketadigan so'rovlar faqat shu saytning
   `/api/*` yo'llariga: `/api/t` (tugma bosildi) va `/api/editor/*` (muharrir) — ular backend'ga server tomondan uzatadi.
2. **Sayt — nol JS'ga yaqin.** Bo'limlar hook'siz server komponentlar (`src/components/sections/*`); yagona client
   orol — `ClientEnhancer` (paydo bo'lish, sanash, tugma kuzatuvi, piksellar) + YouTube fasadi va Countdown.
   Yangi bo'lim ham hook'siz bo'lsin: u `RenderCtx` orqali ham saytda (`createViewCtx`), ham muharrirda
   (`createEditCtx`) bir xil kod bilan chiziladi.
3. **Kontent — bitta JSON hujjat** (`src/lib/doc/types.ts` → `PlusDoc`). Har o'qishda `normalizeDoc` dan o'tadi
   (eski/buzuq hujjat ham sahifani yiqitmaydi), backend esa saqlashda `sanitizePlusDoc` bilan tekshiradi
   (600 KB, chuqurlik, URL'lar faqat http(s)/nisbiy). Hujjat tuzilmasini o'zgartirsangiz — ikkala tomonni ham.
4. **Logotip — 6 variant, «Umumiy → Logotip» da tanlanadi** (`doc.header.logoId`; maydon nomi `logo` bo'lmasin — backend
   `logo` kalitini rasm havolasi deb tekshiradi va rad etadi). `bird` — TASIMO qushcha + harflar + PLUS (`gen-logo.mjs` →
   `logo-data.ts`, `PlusLogo`); `official` — Brand Guidelines dagi rasmiy logotip (oq TASIMO + gradientli PLUS plashkasi; och
   fonda to'q plashka ichida — brend: oq logotipni oq/och fonga qo'ymang); `mountain`, `compass`, `compass2`, `tent` — `branding/`
   dagi PNG'lardan vektorlashtirilgan. Zanjir: `python -X utf8 scripts/trace-logos.py` (rang qatlamlari, marching squares,
   Bézier; palitra hududlari, rasmiy emblema, geometrik plashka) → `scripts/.trace/*.json` + `branding/svg/*.svg` →
   `node scripts/gen-logos.mjs` (animatsiya guruhlari: letter/mark/badge/extra, kesish) → `src/components/logo/logo-art.ts` +
   `branding/svg/animated/*.svg`. Komponent: `SiteLogo` → `PlusLogo` | `ArtLogo` (hook yo'q, `uid` sahifada noyob).
   Animatsiya faqat skrollda (Nordic TV uslubi): harflar belgiga yaqinidan boshlab so'nadi, belgi va PLUS chapga suriladi,
   imzo harakati bir marta (igna, qanot, chodir, iz) — doimiy harakat yo'q; muharrir plitkasida `[data-lg-collapsed]`.
   Yig'ilganda `official` — faqat kattalashgan PLUS (belgi `hide`, to'q plashka ham so'nadi); `mountain` — tog' + chodir +
   yer chizig'i + PLUS (umumiy kontur `PEAK` ko'pburchagi bilan kesiladi, qushchali «O» va ilmoq so'nadi; `collapse` → cx/cy/cs).
   CSS animatsiyada `rotate`/`scale` alohida xususiyatlar (yig'ilish `transform` i bilan to'qnashmasin). Yangi variant: PNG →
   `trace-logos.py` LOGOS + `gen-logos.mjs` CONFIG + `LOGO_IDS` + `LogoPicker` nomi. Favicon — oq doirada navy qushcha.
5. **Muharrir** (`/edit`): parol dashboard → TASIMO Plus → Landing sozlamalari'da o'rnatiladi; token httpOnly
   SameSite=Strict cookie `plus_editor` (12 soat); o'zgartiruvchi yo'llar `sameOrigin()` tekshiradi.
   Saqlash — qoralama (avtomatik, `draftVersion`, boshqa oynada o'zgargan bo'lsa 409) → «E'lon qilish» (tarix,
   oxirgi 50 ta) → `revalidateTag('plus-landing')`. `/edit` indekslanmaydi (X-Robots-Tag + robots).
6. **Kuzatuv** (`src/lib/attribution.ts`, faqat `/`, `/en`, `/ru` da): `.tasimo.uz` cookie'lari `tasimo_vid`
   (tashrifchi), `tasimo_attr` (birinchi kontakt), `tasimo_ses`, `tasimo_plus` (landingda bo'lgan — account kirishda
   tashrifchini foydalanuvchiga bog'laydi) va host-only `plus_ses`. Sessiya boshida backend'ga
   `POST /marketing-campaigns/track/visit {platform: 'PLUS'}` (waitUntil, javob kutilmaydi).
7. **Tugmalar** — faqat `doc.ctas` dagi uchta: `register`, `participate`, `login` (`ctx.cta(key)`). Menyu, footer va
   quti havolalari uch turda (muharrirda tanlanadi): `cta:register` (tugma manzili, kuzatiladi), `#bo'lim`, tashqi havola.
   Saytda havola faqat `ctx.link(href, …)` orqali chiziladi (`lib/doc/links.ts` → resolveLink). Account manzilini menyu
   yoki footer'ga qo'lda yozmang — «Tugma» turini tanlang.
   Account'ga ketadigan havolaga render paytida `utm_source=tasimo_plus&utm_medium=landing&utm_content=<tugma>`
   qo'shiladi (`src/lib/doc/ref.ts`). Sahifa statik, lekin bir vaqtda bir nechta reklama ishlaydi: `ClientEnhancer`
   reklamadan kelgan tashrifchining `a[data-cta]` havolalaridagi utm_* ni uning o'z belgisi bilan almashtiradi
   (`visitorTouch` — `tasimo_attr` cookie, bo'lmasa URL; `withVisitorRef`) — cookie bo'lishmasa ham (Instagram ichidan
   «Brauzerda ochish») account ro'yxatdan o'tishni o'sha reklamaga yozadi. Reklama havolasi — dashboard'dagi reklama
   sahifasidan (`utm_campaign` = reklama slug'i); yalang domen ham bo'ladi: `plus.tasimo.uz/?utm_…` til sahifasiga utm
   bilan o'tadi. Bosish → `/api/t` → `plus_cta_events` + piksellarda Lead hodisasi.
8. **Piksellar** (Meta, TikTok, GA4/Google Ads) faqat dashboard'da ID kiritilgan bo'lsa, `lazyOnload` bilan.
   CSP (`next.config.ts`) faqat shu domenlarga ruxsat beradi — yangi uchinchi tomon skripti qo'shsangiz CSP'ni ham.
   `frame-src` da `'self'` shart — muharrirdagi desktop/planshet/mobil ko'rinish `/edit/preview` ni iframe'da ochadi.
9. **SEO** (`src/lib/seo.ts`) — kontentga tegmaydi, chiqishini mustahkamlaydi: sarlavhada «TASIMO Plus» shart
   (`seoTitle`: admin sarlavhasida bo'lmasa ` — TASIMO Plus` qo'shiladi, bo'sh bo'lsa brend + dekriptor), bo'sh tavsifga
   zaxira (`seoDescription`); canonical, hreflang en/ru/x-default(/en), OG; JSON-LD — bitta `@graph`: Organization
   (`https://tasimo.uz/#organization`, logo `/icon-512.png`) ← WebSite (`url` = subdomen ildizi `/`, nomi «TASIMO Plus»
   + alternateName — Google'dagi sayt nomi) ← WebPage (+ FAQPage, `dateModified` = e'lon sanasi). Sitemap `lastmod` —
   `publishedAt`. Tasdiqlash meta-tegi — `.env` `GOOGLE_SITE_VERIFICATION` / `YANDEX_VERIFICATION` (build paytida).
   Ikonkalar: `node scripts/gen-icons.mjs` (`icon.svg` → `favicon.ico`, `icon-192/512.png`). OG rasm berilmasa —
   `opengraph-image.tsx` (qo'lda yo'l yozmang: Next xeshli havola beradi). Tekshiruv — `tests/seo.test.ts`.
10. **Dizayn — Brand Guidelines bo'yicha, sokin:** ranglar faqat PLUS BLUE `#0A62B3`, PLUS LIGHT `#CEE4F8`, matn/neytral
    `#122C46`, oq (`--color-plus`, `--color-plus-light`, `--color-navy`; och fonlar — PLUS LIGHT ning oq bilan aralashmasi).
    Shrift — Finlandica Text (`next/font`, variable): sarlavha 800/700, matn 400, ma'lumot 500; oddiy matnda tracking 0,
    sun'iy kursiv yo'q. Grafik til — PLUS plashkasi shakli (chap-yuqori va o'ng-past yumaloq: tugmalar, `shape-plate`,
    ikonka), raqam/nuqta/oddiy to'g'ri formula; bir maketda 1–2 bezak. Gradient faqat `#0A62B3 → #CEE4F8` (pastki chapdan
    yuqori o'ngga) va faqat yordamchi grafikada, matn ortida emas. Yulduzcha, suzuvchi belgi, rang-barang kartalar
    qaytarilmasin. Komponent klasslari `globals.css` da `@layer components` ichida (utility'lar ustidan yoza olsin).
    Galereya rasmlari — brend tritone (`scripts/gen-postcards.mjs`: #122C46 → #0A62B3 → och).
11. **Muharrir:** `editor.css` ham `@layer components` da (qatlamsiz qoida Tailwind utility'larini bosib ketadi — EN/RU belgisi
    matn ustiga tushgan edi). Quti asboblari — kanvas ustidagi `BoxToolbar` (quti ichida emas: matnni yopmasin, kesilmasin);
    bo'lim asboblari sticky. `window.confirm` ishlatilmaydi — o'chirish «Qaytarish» xabari bilan, xavfli amal — `useConfirmDialog`.
    Hover holati kontekstga qo'yilmaydi (butun sahifa qayta chizilmasin), kanvas `useMemo` da.
    «Bo'lim qo'shish» oynasi har variantni eskiz (skeleton) bilan ko'rsatadi: yangi bo'lim turi yoki variant qo'shsangiz —
    `PresetThumb.tsx` ga eskiz (`THUMBS['tur:variant']`) va `PresetPicker.tsx` ga izoh (`VARIANT_INFO`) ham qo'shing.
    «Umumiy» paneli — alohida guruhlar (akkordeon: Tugmalar / Menyu / Footer / SEO, bittasi ochiq; sarlavhada qisqacha
    mazmun va xatolar soni; ochiq sarlavha sticky). Yangi umumiy sozlama — mos guruhga (yoki yangi `Group`), bitta uzun
    ro'yxatga emas; guruh ichidagi qismlar `SubHeading` bilan. Tab va ochiq guruh `Editor`da (Inspector havolasi ochadi).
12. **Matn formatlash** (`src/lib/doc/rich.ts`): `Text` satrlari ichida faqat `<b> <i> <u> <span data-c="#rrggbb">
    <span data-g="#rrggbb,#rrggbb">` — qattiq parser, boshqa hammasi oddiy matn («x < 5» buzilmaydi). Saytda
    `renderRich` (React elementlari, innerHTML yo'q), muharrirda `richToHtml` + `editor/rich-dom.ts` va belgilangan matn
    ustidagi `TextFormatBar` (B / I / U / Oddiy / Rang / Gradient, Ctrl+B/I/U, o'z Ctrl+Z tarixi). Matnni atribut, alt,
    SEO, JSON-LD yoki muharrir ro'yxatiga qo'ysangiz — `ctx.t()` / `plainText()` (xom `pick()` emas). O'ng paneldagi
    `TextPair` toza matn ko'rsatadi va `editPlain` bilan formatni saqlaydi; SEO maydonlari `plain`. Rang va gradient —
    admin tanlovi; standart kontent sokin qoladi (10-qoida).
13. **Brend mazmuni (Brand Book):** nom matnda «TASIMO Plus» (logotipda PLUS bosh harfda; TASIMO+, Tasno, Tassimo yo'q,
    TASIMO tarjima qilinmaydi); dekriptor EN «Mathematics Olympiad for Primary School Students», RU «Математическая олимпиада
    для учащихся начальных классов»; shior «Big discoveries begin with small steps.» / kampaniya «Think. Explore. Discover.».
    Tasdiqlanmagan va'da yozilmaydi («g'alaba kafolati», «har bolaga medal», «xalqaro sertifikat»); Plus asosiy TASIMO uchun
    majburiy bosqich sifatida ko'rsatilmaydi; sinflar, sana, format, to'lov — faqat amaldagi nizomdan (taxmin yo'q). Ohang:
    bolaga — qisqa, samimiy; ota-onaga — xotirjam va aniq; ustozga — tartibli va amaliy. `tests/doc.test.ts` taqiqlangan
    iboralarni tekshiradi.
14. Matnda `\uXXXX` escape yozmang — belgining o'zini yozing (NBSP — `String.fromCharCode(160)`).
15. `next dev` AGENTS.md yaratadi — `agentRules: false` turibdi; paydo bo'lsa o'chiring (gitignore'da).
16. **Mijoz IP'si yo'q** (bitta oq IP, oldida Kerio Control NAT): `x-forwarded-for`/`x-real-ip` — Kerio manzili. IP'ni
    cheklov, statistika yoki backend'ga uzatish uchun ishlatmang; cheklov — tashrifchi ID (cookie) yoki umumiy kalit bilan.
17. **Deploy** — `main` ga push → `.github/workflows/deploy.yml` (self-hosted runner, label `plus-tasimo`). Build navbatdagi slotga
    (`NEXT_DIST_DIR=.next-a|.next-b`, faol slot `.next-slot` da, `ecosystem.config.js` o'qiydi) — sayt build paytida
    to'xtamaydi, javob bermasa eski slotga qaytadi. `tsconfig.json` dagi `.next-a`/`.next-b` yo'llarini o'chirmang (Next
    tsconfig'ni qayta yozadi → serverda `git pull` to'xtaydi). nginx — repo'dagi `nginx.conf` (faqat HTTP, HTTPS — Kerio).

## Tuzilma

- `src/app/(site)/[locale]` — landing (`dynamicParams=false`, faqat en/ru); `(editor)/edit` — muharrir (alohida root layout)
- `src/app/api/` — `t`, `revalidate`, `editor/*` (backend'ga proxy)
- `src/lib/doc/` — `types`, `default-doc` (10 bo'lim), `normalize`, `presets` (yangi bo'lim shablonlari), `path`, `ref`
- `src/components/sections/` — bo'limlar va `registry.tsx`; `site/` — Header, Footer (to'liq hujjatdan), ClientEnhancer, Pixels
- `src/components/editor/` — muharrir (holat: `useEditorState`, inline matn, rasm dialogi, inspektor, presetlar, tarix)
- `scripts/gen-postcards.mjs` — `public/art/*.svg` (standart galereya rasmlari)
- `branding/` — Brand Book va Brand Guidelines PDF, manba PNG logotiplar, `svg/` (statik vektor) va `svg/animated/`
  (mustaqil animatsiyali SVG); `scripts/trace-logos.py` + `trace_lib.py` (vektorlashtirish), `scripts/gen-logos.mjs`

## Backend va dashboard

- API modul: `api.tasimo.uz/src/modules/plus` (public / editor / admin controller'lar, analytics, tracking).
  Jadvallar: `plus_landing`, `plus_landing_revisions`, `plus_cta_events`, `visitor_users`; enum'lar
  `TrafficPlatform.PLUS`, `CampaignAudience.PLUS`. Ruxsatlar: `plus:read`, `plus:update`.
- Dashboard: `/tasimo-plus` (Voronka + Landing sozlamalari); reklamalar — «Target reklamalar»da auditoriya «TASIMO Plus».
- Account: `setAuthToken` → `identifyVisitor` (faqat `tasimo_plus` cookie bo'lsa).

## Buyruqlar

`bun run dev` · `bun run typecheck` · `bun test tests` · `bun run build` · `bun start` (3101) · deploy — `docs/deploy.md`
