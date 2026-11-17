# plus.tasimo.uz — deploy qo'llanmasi

Sxema olympiads.tasimo.uz bilan bir xil: `main` ga push → serverdagi self-hosted runner → `git pull` → `bun install` →
build → PM2 restart. Papka nomi = domen: `/var/www/tasimo-main/plus.tasimo.uz`, PM2 nomi `plus.tasimo.uz`, port **3101**.

## Tartib

1. **API** (api.tasimo.uz) — Plus moduli allaqachon push qilingan (migratsiya `20261111140000_plus_landing`, ruxsatlar
   `plus:read` / `plus:update`). Serverdagi API env'iga (ecosystem / `.env.production`) qo'shing va API'ni qayta ishga
   tushiring (yoki keyingi API deployini kuting):
   ```
   PLUS_SITE_URL=http://127.0.0.1:3101          # e'londan keyin keshni darhol tozalash webhook'i (ichki manzil)
   PLUS_SITE_PUBLIC_URL=https://plus.tasimo.uz  # reklama havolalari va dashboard'dagi «Muharrirni ochish» (standart shu)
   # PLUS_REVALIDATE_SECRET=...                 # ixtiyoriy; bo'lmasa REVALIDATE_SECRET ishlatiladi
   ```
   `PLUS_SITE_URL` bo'lmasa ham sayt ishlaydi — e'lon qilingan matn 5 daqiqada o'zi yangilanadi.
2. **Sayt** — pastdagi «Server» bo'limi.
3. **Dashboard / account** — o'zgarish talab qilmaydi (Plus qismlari allaqachon push qilingan).

## Server (bir martalik)

1. **DNS va Kerio:** `plus.tasimo.uz` → dashboard kabi (A yozuvi + Kerio Control'da domen uchun qoida). HTTPS'ni Kerio
   qo'llaydi — certbot va 443 bloki kerak emas.
2. **Kod:**
   ```bash
   cd /var/www/tasimo-main
   git clone https://github.com/Nordic-International-University/plus.tasimo.uz.git
   ```
3. **`.env`** (gitignore'da, faqat serverda, `/var/www/tasimo-main/plus.tasimo.uz/.env`):
   ```
   API_URL=https://api.tasimo.uz
   SITE_URL=https://plus.tasimo.uz
   ACCOUNT_URL=https://account.tasimo.uz
   REVALIDATE_SECRET=<API'dagi PLUS_REVALIDATE_SECRET yoki REVALIDATE_SECRET bilan AYNAN bir xil>
   ```
   `ecosystem.config.js` da faqat NODE_ENV, PORT va NEXT_DIST_DIR — u yerga sir yozmang (bo'sh qiymat `.env` ni bekitadi).
4. **GitHub runner** — repo → Settings → Actions → Runners → New self-hosted runner (Linux). Sozlashda label
   **`plus-tasimo`** bering (workflow `runs-on: [self-hosted, plus-tasimo]`):
   ```bash
   ./config.sh --url https://github.com/Nordic-International-University/plus.tasimo.uz --token <TOKEN> \
     --name plus-tasimo --labels plus-tasimo --unattended
   sudo ./svc.sh install <olympiads runner ishlayotgan foydalanuvchi> && sudo ./svc.sh start
   ```
   Runner olympiads runner'i bilan bir foydalanuvchida ishlasin: `bun`, `pm2`, `git` shu foydalanuvchining PATH'ida va
   PM2 jarayonlari shu foydalanuvchiniki bo'ladi.
5. **Birinchi ishga tushirish:** GitHub → Actions → «Deploy plus.tasimo.uz» → **Run workflow** (yoki `main` ga istalgan
   push). Workflow o'zi `bun install`, build va `pm2 start ecosystem.config.js` + `pm2 save` qiladi.
6. **nginx** — repo'dagi `nginx.conf` (faqat `listen 80`, `absolute_redirect off`, upstream `127.0.0.1:3101`):
   ```bash
   sudo cp /var/www/tasimo-main/plus.tasimo.uz/nginx.conf /etc/nginx/sites-available/plus.tasimo.uz
   sudo ln -sf /etc/nginx/sites-available/plus.tasimo.uz /etc/nginx/sites-enabled/plus.tasimo.uz
   sudo nginx -t && sudo systemctl reload nginx
   ```
   **Mijoz IP'si yo'q:** server bitta oq IP orqali, oldida Kerio Control (NAT) — nginx va sayt hamma so'rovni Kerio
   manzilidan ko'radi. Shuning uchun sayt IP'ni hech qayerda ishlatmaydi: tugma va tashrif kuzatuvi tashrifchi ID (cookie)
   bo'yicha cheklanadi, muharrir paroliga noto'g'ri urinishlar umumiy sanaladi (backend: 15 daqiqada 20 ta, nginx:
   daqiqasiga 10 so'rov). Bu faylga IP bo'yicha `limit_req`/`limit_conn` qo'shmang — u butun saytni bitta odamdek cheklaydi.
7. **Tekshirish:**
   - `curl -I http://127.0.0.1:3101/en` (serverda) → 200
   - `https://plus.tasimo.uz/` → brauzer tiliga qarab `/en` yoki `/ru`
   - `https://plus.tasimo.uz/sitemap.xml`, `/robots.txt`
   - `curl -X POST https://plus.tasimo.uz/api/revalidate -H "x-revalidate-secret: <sir>" -H "content-type: application/json" -d '{"tags":["plus-landing"]}'` → 200

## Har deploy qanday ishlaydi (`.github/workflows/deploy.yml`)

- Build navbatdagi slotga yoziladi: `.next-a` yoki `.next-b` (`NEXT_DIST_DIR`). Ishlab turgan sayt build paytida
  to'xtamaydi — faqat PM2 restart paytida 1–2 soniya.
- Faol slot `.next-slot` faylida; `ecosystem.config.js` uni o'qib `NEXT_DIST_DIR` ni PM2 env'iga beradi.
- Restartdan keyin `http://127.0.0.1:3101/en` 40 soniyada javob bermasa — avtomatik eski slotga qaytariladi va job
  qizil bo'ladi (PM2 loglari job chiqishida).
- Qo'lda oldingi buildga qaytish (kod emas, faqat build):
  ```bash
  cd /var/www/tasimo-main/plus.tasimo.uz
  cat .next-slot                                   # masalan .next-b
  echo .next-a > .next-slot && pm2 restart ecosystem.config.js --update-env && pm2 save
  ```
- `tsconfig.json` da `.next-a` / `.next-b` yo'llari oldindan yozilgan — aks holda Next build faylni qayta yozadi va
  keyingi `git pull` to'xtab qoladi. Yangi slot nomi qo'shsangiz, tsconfig'ga ham qo'shing.

## Google Search Console va Yandex Webmaster

Kod tomoni tayyor: brendli sarlavha (admin yozgan sarlavhada «TASIMO Plus» bo'lmasa oxiriga qo'shiladi), canonical,
hreflang en/ru/x-default, bog'langan JSON-LD (Organization TASIMO ← WebSite «TASIMO Plus» ← WebPage + FAQ), sitemap
(`lastmod` = oxirgi e'lon), robots.txt, `/favicon.ico` va 512 px logo.

1. **Tasdiqlash** — ikki yo'ldan biri:
   - **Domen** (tavsiya): GSC → Add property → *Domain* → `tasimo.uz` → DNS'ga TXT yozuv. Barcha subdomenlarni qamraydi;
     `tasimo.uz` domeni GSC'da allaqachon tasdiqlangan bo'lsa, plus ham shu yerda — hech narsa qilish shart emas.
   - **URL prefiksi**: *URL prefix* → `https://plus.tasimo.uz/` → *HTML tag* → `content="…"` qiymatini serverdagi `.env` ga
     `GOOGLE_SITE_VERIFICATION=…` qilib yozing → Actions → «Deploy plus.tasimo.uz» → **Run workflow** (meta-teg build
     paytida qo'shiladi) → GSC'da **Verify**. Yandex Webmaster uchun xuddi shunday `YANDEX_VERIFICATION=…`.
2. **Sitemaps** → `https://plus.tasimo.uz/sitemap.xml` → Submit.
3. **URL Inspection** → `https://plus.tasimo.uz/en` va `/ru` → *Request indexing*.
4. Tekshirish: [Rich Results Test](https://search.google.com/test/rich-results) (`/en` — FAQ va sayt nomi xatosiz),
   bir necha kundan keyin Google'da `TASIMO Plus` va `site:plus.tasimo.uz`.
5. Indekslashni tezlatadi: tasimo.uz saytidan (menyu yoki footer), Instagram/Telegram profilidan `plus.tasimo.uz` ga havola.

Server tomonidagi talab: `http://plus.tasimo.uz` hozir 403 qaytaradi — Kerio'da 80-portdan `https://` ga 301 yo'naltirish
qo'ying (havolalar http bilan tarqalsa Google 403 ni «sahifa yo'q» deb oladi).

## Ishga tushgandan keyin (dashboard)

1. **TASIMO Plus → Landing sozlamalari:** muharrir parolini o'rnating (kamida 8 belgi).
2. `https://plus.tasimo.uz/edit` → parol → matn va rasmlarni tekshiring → **E'lon qilish**.
   Standart matnda sovrin, narx va aniq sanalar yo'q — ularni o'zingiz yozing. Format standart matnda: yiliga ikki mavsum
   (qishki va yozgi), har mavsum — 1-bosqich onlayn saralash, 2-bosqich Toshkentda offline final.
3. Reklama piksellari (Meta, TikTok, GA4, Google Ads + lid yorlig'i) — bo'sh qolsa piksel yuklanmaydi.
4. **Voronka olimpiadalari:** shu mavsumning olimpiadasini qo'shing (aks holda hamma olimpiadadagi yozilish/to'lov sanaladi).
5. **Target reklamalar → Yangi reklama → Kimga: TASIMO Plus** — har bir reklama uchun alohida; tayyor en/ru havola
   reklama sahifasida. Xarajatni o'sha reklamaga kiriting — voronkada lid/ro'yxat/to'lovchi narxi va ROAS chiqadi.

## Eslatmalar

- Tashrifchi ↔ foydalanuvchi bog'lanishi `.tasimo.uz` cookie'lariga tayanadi: ro'yxatdan o'tishda (visitorId) va
  account'ga kirishda (`tasimo_plus` belgisi bo'lsa). Boshqa brauzer/qurilmada ro'yxatdan o'tgan odam voronkada
  «ro'yxatdan o'tdi» ga tushmaydi (account havolasidagi `utm_source=tasimo_plus` esa account statistikasida ko'rinadi).
- Voronka kogortasi — davrda landingga kirganlar; keyingi qadamlar shu kirishdan keyin, bugungacha.
