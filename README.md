# Штукатурка PRO — MVP

Платформа для клиентов компании механизированной штукатурки: личный кабинет с прогрессом ремонта в реальном времени.

## Что реализовано в этом MVP

- ✅ Регистрация клиента (телефон + email + пароль) — `/register`
- ✅ Авторизация через NextAuth (Credentials) — `/login`
- ✅ Ролевая модель: `CLIENT`, `ADMIN`, `FOREMAN` (защита роутов через `middleware.ts`)
- ✅ Дашборд клиента: круговой прогресс проекта, метрики, карточки комнат — `/dashboard`
- ✅ Загрузка отчёта бригадиром (площадь, чек-лист, комментарий, фото) — `/dashboard/reports/new`
- ✅ API `/api/reports` — создание отчёта, автоматический пересчёт прогресса комнаты
- ✅ Хроника работ (timeline) с фото — `/dashboard/timeline`
- ✅ Полная схема БД (Prisma) под все фичи из ТЗ: материалы, документы, платежи, чат, чек-листы качества, AI-сводки, уведомления

## Интеграция: скан квартиры → чертёж → смета → платформа

Полная цепочка автоматизации онбординга:

```
Клиент сканирует комнаты (RoomScanner / любое LiDAR-приложение)
        ↓ экспорт
MeasureSquare (строит чертёж + считает смету по м²)
        ↓ webhook на /api/integrations/measuresquare/webhook
Штукатурка PRO — автоматически создаёт/обновляет:
  • Room (площадь каждой комнаты)
  • EstimateItem (построчная смета)
  • Document (PDF чертежа)
  • Project.area / roomsCount (пересчитано)
```

### Что нужно для запуска интеграции

1. Написать на `integration@measuresquare.com`, запросить группу и API-ключ (X-Application + secret).
2. Заполнить `MEASURESQUARE_APPLICATION_ID` и `MEASURESQUARE_SECRET_KEY` в `.env`.
3. В кабинете MeasureSquare Cloud указать **Notification URL**:
   `https://ваш-домен/api/integrations/measuresquare/webhook`
4. **Важно уточнить у MeasureSquare**: как передать наш `Project.id` как `external_reference` при создании проекта в их системе — это единственный способ связать их проект с нашим. Уточняется в Integration API Spec после получения доступа.
5. Файлы: `lib/measuresquare.ts` (HMAC-клиент), `app/api/integrations/measuresquare/webhook/route.ts` (приём данных).

### Альтернатива без MeasureSquare

Если решите не подключать MeasureSquare, а строить сканирование сразу в своём iOS-приложении на Apple RoomPlan API — эндпоинт `app/api/projects/[id]/import-scan/route.ts` уже принимает полигон стен и площадь напрямую с устройства, минуя посредника.

## Что нужно доделать дальше (roadmap)


1. **Интерактивный план квартиры** (`/dashboard/plan`) — SVG-оверлей поверх `floorPlanUrl`, клик по зоне → модалка комнаты.
2. **Реальная загрузка файлов** — заменить `uploadPhotoStub` в `app/api/reports/route.ts` на Supabase Storage / Cloudinary SDK.
3. **AI-сводки** — cron job (Vercel Cron), который раз в день агрегирует `Report` и вызывает Anthropic API для генерации текста в `AISummary`.
4. **Уведомления** — интеграция Telegram Bot API + web push + email (Resend/SendGrid).
5. **Онбординг** (`/onboarding`) — форма добавления объекта с загрузкой плана квартиры.
6. **Разделы Материалы / Финансы / Документы / Чат** — модели в схеме уже готовы, нужны страницы + API.
7. **Экспорт PDF-отчёта** — `@react-pdf/renderer`, фирменный шаблон с логотипом и метриками.
8. **Панель ADMIN** (`/admin`) — список всех проектов, назначение бригад, управление клиентами.
9. **PWA** — добавить `manifest.json` и service worker для мобильного использования на объекте.

## Запуск локально

```bash
npm install
cp .env.example .env       # заполните DATABASE_URL и NEXTAUTH_SECRET
npx prisma migrate dev --name init
npx tsx prisma/seed.ts     # тестовые пользователи и проект
npm run dev
```

Тестовые пользователи после seed (пароль у всех `password123`):

| Роль    | Телефон        |
|---------|----------------|
| CLIENT  | +79000000001   |
| FOREMAN | +79000000002   |
| ADMIN   | +79000000003   |

## Технологии

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL · NextAuth · Framer Motion · Recharts

## Дизайн

Брендовая палитра — глубокий тёмно-синий (`#1B2A4A`) + тёплое золото (`#D9A441`), премиум-ощущение без вычурности. Палитра задана в `tailwind.config.ts`, легко заменить под реальный логотип компании.
