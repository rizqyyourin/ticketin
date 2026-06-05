# Daily Progress Log

## 2026-06-05 — Feature: Dashboard Real Data Integration

- Area: frontend, backend
- Summary:
  1. **`GET /api/dashboard?from=<ISO>&to=<ISO>`** (baru) — query Prisma real: `ServiceRequest.groupBy(status)` untuk stats ticket, `CsatSurvey.groupBy(rating)` untuk CSAT, count SLA breached (dueDate < now AND status not resolved/closed). Trend dihitung vs periode sebelumnya (durasi sama, window prior).
  2. **Dashboard page** — hapus `periodData` static mock. Tambah `DashboardData` type, `getPresetRange` helper, `activeDateRange` state. `useEffect` fetch API setiap `activeDateRange` berubah. Derived values: `stats[]`, `csatItems[]`, `slaBreachedPct`, `slaInSlaPct`.
  3. Filter tabs (Today/Last Week/This Month/Custom) sekarang trigger real fetch. Custom range Apply juga trigger fetch. Loading state: opacity-50 saat fetching.
  4. **Build verified** — `npm run build` pass. Zero errors.
- Files:
  - `src/app/api/dashboard/route.ts` (baru)
  - `src/app/(protected)/dashboard/page.tsx`
- Notes:
  - Status bucket: New=`new`, In Progress=`open+in_progress+pending`, Resolved=`resolved`, Closed=`closed`.
  - SLA breached = ticket dalam periode yg dueDate sudah lewat tapi masih open.
  - CSAT data berdasarkan `submittedAt` dalam range, bukan `createdAt` ticket.
- Next: seed data real ke DB untuk verifikasi tampilan dashboard.

## 2026-06-05 — Feature: Template Picker di Comment Tab Service Request

- Area: frontend, backend
- Summary:
  1. **`GET /api/email-templates`** (baru) — fetch `EmailTemplate` dari DB (Prisma model sudah ada di schema). Juga expose `POST /api/email-templates` untuk create template baru.
  2. **`TemplatePickerModal`** — komponen baru di halaman SR detail. Fetch dari `/api/email-templates`; jika DB kosong, fallback ke `MOCK_TEMPLATES`. Split-panel layout: kiri list + search, kanan preview rendered. Variable interpolation: `{{customer_name}}`, `{{ticket_number}}`, `{{ticket_subject}}`, `{{agent_name}}`, `{{priority}}`, `{{sla_deadline}}` di-replace dengan data ticket aktual.
  3. **Button "Template"** — toolbar di atas textarea comment. Klik → buka TemplatePickerModal. Pilih template → klik "Use this template" → body ter-render masuk ke `commentInput`. Agent bisa edit dulu sebelum Send. Alur send email ke customer tetap sama (via `POST /api/service-requests/:id/comments`).
  4. **Build verified** — `npm run build` pass. Zero errors.
- Files:
  - `src/app/api/email-templates/route.ts` (baru — GET list + POST create)
  - `src/app/(protected)/service-request/[id]/page.tsx` (tambah TemplatePickerModal + button toolbar)
- Notes:
  - Template variables yang tersedia: `{{customer_name}}`, `{{ticket_number}}`, `{{ticket_subject}}`, `{{agent_name}}`, `{{priority}}`, `{{sla_deadline}}`. Variable lain (misal `{{reset_link}}`) tidak di-replace, tetap tampil as-is.
  - DB EmailTemplate kemungkinan masih kosong — fallback ke MOCK_TEMPLATES agar langsung usable. Buat/seed template real via Settings > Email Templates.
- Next: Integrasi Settings Email Templates page ke API (ganti localStorage/mock ke DB).

## 2026-06-05 — Fix: Signup Page Wiring ke Database

- Area: frontend, backend
- Summary: Signup form sebelumnya hanya simulasi (langsung redirect tanpa kirim data). Tidak ada public endpoint untuk registrasi.
  - Buat `POST /api/auth/register` — public endpoint, tidak butuh session. Validasi input, cek duplikat email/username, hash password bcrypt, simpan ke DB dengan userId auto-generate (USR-XXX).
  - Update signup page: form fields jadi controlled state (`username`, `email`, `password`). Submit POST ke `/api/auth/register`. Tampil error dari server. Loading state on button. Redirect ke login on success.
  - Label "Full Name" diganti "Username" sesuai schema DB.
- Files:
  - `src/app/api/auth/register/route.ts` (baru)
  - `src/app/auth/signup/page.tsx`
- Next action: test register user baru via signup page, cek muncul di DB.

## 2026-06-05 — Bugfix: CSAT Survey Email Threading

- Area: backend
- Summary: CSAT survey emails (both `every_reply` dan `ticket_resolved` triggers) sekarang masuk ke thread email yang sama, bukan buat thread baru.
  - **Root cause:** `sendCsatSurveyEmail` di `comments/route.ts` tidak meneruskan `threadId` → email dikirim tanpa `In-Reply-To`/`References` header → Gmail buat thread baru.
  - **Fix 1** — `comments/route.ts`: tambah import `sendCsatSurveyEmail` dan `randomBytes` (keduanya missing). Pass `threadId: ticket.emailThreadId ?? ticketThreadId(ticket.ticketNumber)` ke CSAT email call.
  - **`service-requests/[id]/route.ts`** sudah benar — sudah pass `current.emailThreadId` sebagai `threadId`.
- Files:
  - `src/app/api/service-requests/[id]/comments/route.ts`
- Next action: test kirim agent comment → cek CSAT email masuk thread sama di inbox customer.

## 2026-06-02 — Service Request: UX Improvements + Queue Assign + Auto-Escalation

- Area: frontend, backend, database
- Summary:
  1. **Schema** — Tambah `new` ke `Status` enum. Default status ServiceRequest berubah dari `open` → `new`. `prisma db push` applied.
  2. **`features/service-request/types.ts`** — Tambah `new` ke `Status` type. Tambah `QueueWithMembers` + `QueueMemberUser` types.
  3. **`service-request/new/page.tsx`** — Replace native `<datalist>` dengan custom Combobox (styled, searchable, avatar, close button, keyboard-friendly). Replace "Assign To" flat user dropdown dengan Queue→User cascade picker (pilih queue dulu, baru pilih user dari members queue tersebut). Status auto-set display: `New` (bukan `Open`).
  4. **`service-request/[id]/page.tsx`** — Tambah `new` ke STATUS_TRANSITIONS dan STATUS_STYLES. Replace AssignModal: step-1 queue picker → step-2 user from queue members, ada opsi "assign to queue only", escalation hint. Track `currentQueueId` state, pass ke modal dan persist ke PATCH.
  5. **`api/service-requests/[id]/route.ts`** — Rewrite GET: tambah `checkAndEscalate()` — lazy evaluation setiap kali ticket di-fetch. Logic: jika ticket assigned + punya queue + active status + last assignment > 5 menit + assigned user belum comment sejak assignment → auto-escalate ke next member (round-robin by QueueMember.id). Rewrite PATCH: tambah support `queueId` field + queue-only assignment log.
  6. **Build verified** — `npm run build` pass. Zero errors.
- Files:
  - `prisma/schema.prisma` (Status enum + default)
  - `src/features/service-request/types.ts` (new Status + Queue types)
  - `src/app/(protected)/service-request/page.tsx` (new status style + sort order)
  - `src/app/(protected)/service-request/new/page.tsx` (custom combobox + queue-user assign)
  - `src/app/(protected)/service-request/[id]/page.tsx` (new status + queue assign modal)
  - `src/app/api/service-requests/[id]/route.ts` (escalation logic + queueId PATCH)
- Escalation notes:
  - Escalation is lazy (triggered on ticket fetch, not cron). No extra infra needed.
  - Queue order: `QueueMember.id` ascending (creation order).
  - After last member: wraps around to first (round-robin).
  - Condition: no comment from assigned user since last assignment activity log.
- Next: Dashboard integration / Roles & Permission.



- Area: frontend, backend, docs
- Summary:
  1. **`features/service-request/types.ts`** — Baru. Semua shared types dari shape API nyata: `ServiceRequestDetail`, `ServiceRequestListItem`, `SRComment`, `SRActivityLog`, `SRAssignedUser`, `Priority`, `Status`, `SLA_HOURS`. Pisah dari mock-data.ts.
  2. **`service-request/page.tsx`** — Rewrite. Hapus `ALL_REQUESTS` + localStorage. Fetch dari `GET /api/service-requests`. Loading skeleton (6 rows animate-pulse). Error banner. Field mapping: `contact.customerName` untuk kolom customer, `contact.email` untuk sub-label. Sort + infinite scroll tetap client-side.
  3. **`service-request/new/page.tsx`** — Rewrite. Fetch `GET /api/contacts` untuk datalist customer (Option A: select existing). Fetch `GET /api/users` untuk dropdown Assign To. Validasi: customer harus dipilih dari contacts existing (jika tidak ada → hint link ke `/contact`). Email auto-fill dari contact. Submit `POST /api/service-requests` dengan `contactId`. Redirect ke `/:id` setelah sukses.
  4. **`service-request/[id]/page.tsx`** — Rewrite. Fetch `GET /api/service-requests/:id` on mount. Change Status: `PATCH /api/service-requests/:id` dengan `{ status }` + optimistic activity log append. Assign: fetch `GET /api/users` → `PATCH /api/service-requests/:id` dengan `{ assignedTo: userId }`. Add Comment: `POST /api/service-requests/:id/comments`. Loading spinner + error state semua aksi.
  5. **`api/service-requests/[id]/route.ts`** — Fix PATCH: lookup username dari DB sebelum tulis activity log assignment (sebelumnya: "Assigned to user clx..." → sekarang: "Assigned to rizky.a").
  6. **`docs/api documentation/service-request.md`** — Baru. Dokumentasi lengkap: create, update status, assign, add comment. Sequence diagram, ERD, status lifecycle, SLA table, edge cases.
  7. **Build verified** — `npm run build` sukses. `/service-request` (static), `/service-request/[id]` (dynamic), `/service-request/new` (static). Zero TypeScript errors.
- Files:
  - `src/features/service-request/types.ts` (new — API types)
  - `src/app/(protected)/service-request/page.tsx` (rewrite — API integration)
  - `src/app/(protected)/service-request/new/page.tsx` (rewrite — API integration)
  - `src/app/(protected)/service-request/[id]/page.tsx` (rewrite — API integration)
  - `src/app/api/service-requests/[id]/route.ts` (fix PATCH assign log label)
  - `docs/api documentation/service-request.md` (new — full API spec)
- Notes:
  - Mock data (`mock-data.ts`) dipertahankan untuk kompatibilitas — tidak ada import aktif ke halaman SR lagi. Bisa dihapus di cleanup task berikutnya.
  - Customer picker di form baru: harus pilih dari existing contacts. Jika customer baru → buat di `/contact` dulu.
- Next: Dashboard integration (replace mock metrics dengan data real dari `/api/service-requests`).



- Area: frontend, backend, database
- Summary:
  1. **`contact/page.tsx`** — Hapus mock data + localStorage. Fetch dari `GET /api/contacts`. Loading state tambah. Null-safe untuk `phone` dan `organization` field.
  2. **`contact/[id]/page.tsx`** — Full rewrite. `NewContactForm`: POST ke `/api/contacts` dengan error handling. `EditModal`: PATCH ke `/api/contacts/:id` (whitelist fields). `DeleteModal`: DELETE ke `/api/contacts/:id`, redirect ke list. Detail view: fetch contact + related service requests by `contactId` via `Promise.all`. Hapus semua mock + localStorage dependency.
  3. **`api/contacts/[id]/route.ts`** — Fix PATCH: whitelist field (`title`, `customerName`, `phone`, `email`, `organization`), hapus mass assignment.
  4. **`api/service-requests/route.ts`** — Tambah `contactId` query param filter untuk support detail page related tickets.
  5. **`prisma/seed.ts`** — Tambah seed: 3 contacts (Andi Pratama, Citra Dewi, Budi Santoso) + 2 service requests (SR0001, SR0002) linked ke contacts. `npm run db:seed` sukses.
  6. **Build verified** — `npm run build` sukses. `/contact` static, `/contact/[id]` dynamic.
- Files:
  - `src/app/(protected)/contact/page.tsx` (rewrite — API integration)
  - `src/app/(protected)/contact/[id]/page.tsx` (rewrite — full API integration)
  - `src/app/api/contacts/[id]/route.ts` (fix PATCH whitelist)
  - `src/app/api/service-requests/route.ts` (tambah contactId filter)
  - `prisma/seed.ts` (tambah contacts + service requests seed)
- Next: Integrasi frontend Service Request page ke `/api/service-requests` (replace mock data).

## 2026-06-02 - User Management: Clickable Status Toggle

- Area: frontend
- Summary: Status badge di semua tab User Management (Users, Queue, Roles) sekarang clickable. Klik toggle antara `active`/`inactive` via PATCH ke endpoint masing-masing. Loader spinner muncul saat proses. Toast success/error ditampilkan. Row navigation tidak terganggu (stopPropagation untuk Users & Queue tabs).
- Files:
  - `src/app/(protected)/user-management/page.tsx` (tambah `togglingId` state + `handleToggleStatus` di UsersTab, QueueTab, RolesTab; ganti `<span>` status jadi `<button>`)
- Next: Integrasi frontend Contact page ke `/api/contacts` (replace mock data).

## 2026-06-03 - Fix: Sidebar Permissions Tidak Reaktif Setelah Save Modal

- Area: frontend
- Summary: Setelah save permissions di modal (RolesTab), sidebar tidak update karena layout hanya re-fetch `/api/me` saat pathname berubah. Fix: ekstrak `fetchPermissions` ke `useCallback`, tambah `window.addEventListener('permissions-updated', ...)` di layout, dan `window.dispatchEvent(new Event('permissions-updated'))` setelah save berhasil di modal.
- Files:
  - `src/app/dashboard/layout.tsx` (tambah useCallback + custom event listener)
  - `src/app/dashboard/user-management/page.tsx` (dispatch event setelah save permissions)
- Next: Integrasi frontend Contact page ke `/api/contacts` (replace mock data).

## 2026-06-03 - User Management Module: Full API Integration

- Area: frontend, backend
- Summary:
  1. **`user-management/page.tsx`** — Rewrite penuh. Hapus semua MOCK_* dan localStorage. Tiap tab (Users/Queue/Roles) fetch dari `/api/users`, `/api/queues`, `/api/roles`. AddRoleModal POST ke `/api/roles`. RolesTab punya `refreshKey` prop untuk trigger re-fetch setelah role baru disimpan.
  2. **`users/[id]/page.tsx`** — Rewrite penuh. `NewUserForm`: tambah field password (required), role picker dari `/api/roles`, POST ke `/api/users`. Detail page: fetch `/api/users/:id` (include queueMemberships). Edit modal: PATCH ke `/api/users/:id`. Toggle status via PATCH.
  3. **`queue/[id]/page.tsx`** — Rewrite penuh. `NewQueueForm`: member picker dari `/api/users`, POST ke `/api/queues` dengan `memberIds`. Detail page: fetch `/api/queues/:id`. Add/remove member: PATCH dengan full `memberIds` array. Edit modal, toggle status via PATCH.
  4. **Seed re-run** — `npm run db:seed` sukses memastikan module-level permissions (format `{ "Service Request": true, ... }`) di DB.
  5. **Build verified** — `npm run build` sukses. Semua 3 halaman terdaftar sebagai dynamic (`ƒ`) routes.
- Files:
  - `src/app/dashboard/user-management/page.tsx` (rewrite — API integration)
  - `src/app/dashboard/user-management/users/[id]/page.tsx` (rewrite — API integration + password field)
  - `src/app/dashboard/user-management/queue/[id]/page.tsx` (rewrite — API integration + member management)
- Next: Integrasi frontend Contact page ke `/api/contacts` (replace mock data).


## 2026-06-02 - Auth Integration: Login Page + Middleware

- Area: frontend, backend
- Summary:
  1. **Login page** — Ganti hardcoded credential check dengan `signIn("credentials", { redirect: false })` dari `next-auth/react`. Tambah `loading` state agar tombol disabled saat request berjalan.
  2. **Middleware** — Buat `src/middleware.ts` yang mengeksport `auth` dari NextAuth sebagai middleware. Semua route `/dashboard/*` otomatis di-protect — unauthenticated user di-redirect ke `/auth/login`.
  3. **Build verified** — `npm run build` sukses, middleware terdaftar sebagai `ƒ Proxy (Middleware)`.
- Files:
  - `src/app/auth/login/page.tsx` (replace hardcoded auth → signIn())
  - `src/middleware.ts` (new — route protection)
- Next: Integrasi frontend Contact page ke `/api/contacts`.

- Area: database
- Summary: Buat seed script untuk admin role dan user pertama.
  1. **`prisma/seed.ts`** — Seed `Role` Admin dengan full permissions (`view/create/update/delete` untuk semua 6 modul), lalu seed `User` `dev@ticketin.co.id` dengan password di-hash bcrypt, linked ke role Admin. Menggunakan `upsert` agar idempotent.
  2. **`package.json`** — Tambah script `db:seed` dan config `prisma.seed` untuk `npx prisma db seed`.
  3. **Verified** — Data terkonfirmasi masuk DB via psql: `USR-001 | dev.admin | dev@ticketin.co.id | active`.
- Files:
  - `prisma/seed.ts` (new)
  - `package.json` (tambah scripts db:seed + prisma.seed config)
- Next: Ganti login page dari hardcoded credentials ke `signIn()` NextAuth.

- Area: backend, database, docs
- Summary:
  1. **Analisis arsitektur** — Audit menyeluruh semua mock data & model yang ada (`User`, `Queue`, `Role`, `Contact`, `ServiceRequest`, `Comment`, `ActivityLog`, `EmailTemplate`, `KnowledgeArticle`, `CsatSurvey`). Semua siap migrasi ke DB.
  2. **Dependencies baru** — Install `prisma@7`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `next-auth@beta`, `bcryptjs`.
  3. **Prisma Schema** — Buat `prisma/schema.prisma` lengkap mencakup semua model dengan relasi, enum, dan constraint. Kompatibel dengan Prisma 7 (tanpa `url` di datasource, pakai `prisma.config.ts`).
  4. **Database connection** — `prisma db push` sukses ke PostgreSQL di `103.47.224.225:5432/ticketin_db`. Semua tabel terbuat. Prisma client di-generate dengan `PrismaPg` adapter (wajib Prisma 7).
  5. **`src/lib/prisma.ts`** — Singleton PrismaClient dengan `PrismaPg` adapter untuk koneksi ke PostgreSQL.
  6. **`src/lib/auth.ts`** — NextAuth.js v5 setup dengan Credentials provider + JWT strategy. Password di-verify dengan `bcryptjs`. Session menyimpan `id` dan `role`.
  7. **API Routes** — Buat skeleton API routes dengan auth guard (`auth()`) untuk semua modul:
     - `POST /api/auth/[...nextauth]` — NextAuth handler
     - `GET/POST /api/contacts` + `GET/PATCH/DELETE /api/contacts/[id]`
     - `GET/POST /api/service-requests` + `GET/PATCH /api/service-requests/[id]` + `POST /api/service-requests/[id]/comments`
     - `GET/POST /api/users` + `GET/PATCH /api/users/[id]`
     - `GET/POST /api/queues`
     - `GET/POST /api/roles`
  8. **`.env.example`** — Update dengan variabel `AUTH_SECRET` dan `NEXTAUTH_URL`.
  9. **Build passed** — `npm run build` sukses tanpa error, semua 9 API routes terdaftar sebagai dynamic routes.
- Files:
  - `prisma/schema.prisma` (new — complete schema)
  - `prisma.config.ts` (generated by Prisma init)
  - `src/lib/prisma.ts` (new — Prisma singleton with pg adapter)
  - `src/lib/auth.ts` (new — NextAuth v5 config)
  - `src/app/api/auth/[...nextauth]/route.ts` (new)
  - `src/app/api/contacts/route.ts` + `[id]/route.ts` (new)
  - `src/app/api/service-requests/route.ts` + `[id]/route.ts` + `[id]/comments/route.ts` (new)
  - `src/app/api/users/route.ts` + `[id]/route.ts` (new)
  - `src/app/api/queues/route.ts` (new)
  - `src/app/api/roles/route.ts` (new)
  - `.env` (tambah AUTH_SECRET + NEXTAUTH_URL)
  - `.env.example` (update)
- Notes:
  - Prisma 7 wajib pakai driver adapter (`PrismaPg`) — tidak bisa pakai `new PrismaClient()` langsung.
  - `session.user` di NextAuth bisa `undefined` saat type check — semua penggunaan sudah pakai optional chaining.
  - Frontend masih mock data, integrasi ke API menjadi next step.
- Next: 
  1. Buat seed script untuk admin user pertama (`prisma/seed.ts`).
  2. Ganti auth login page dari hardcoded ke API call NextAuth `signIn()`.
  3. Integrasi frontend Contact page ke `/api/contacts`.

## 2026-05-30 - Service Request Detail Page — UX Polish

- Area: frontend
- Summary:
  1. **Breadcrumb** — Buat komponen reusable `Breadcrumb` di `src/components/ui/breadcrumb.tsx`. Ganti back-arrow lama dengan breadcrumb `Service Request / SR0001` yang bisa dipakai di semua modul.
  2. **Hapus tombol Add Comment** dari header action (akan diganti email SMTP). Comment textarea di dalam section comments tetap ada.
  3. **Change Status modal** — Implementasi frontend-only dengan state machine yang terdokumentasi: `open → in_progress|closed`, `in_progress → pending|resolved|closed`, `pending → in_progress|closed`, `resolved → closed`. Setiap pilihan tampil dengan badge + hint.
  4. **Assign modal** — Menampilkan agen dari `QUEUE_AGENTS` yang difilter berdasarkan queue/category tiket. Agen dalam queue ditampilkan di group "In Queue", sisanya di "Other Agents". Ada opsi Unassign.
  5. **Activity card** — Tampil 3 item pertama, sisanya tersembunyi dengan tombol "Show X more" / "Show less".
  6. **Status & Priority badge** — Dipindah dari header tiket ke sisi kanan header card "Ticket Info".
  7. **QUEUE_AGENTS** — Ditambahkan ke `mock-data.ts` dengan field `id, name, email, role, queues[]`.
- Files:
  - `src/components/ui/breadcrumb.tsx` (new — reusable)
  - `src/features/service-request/mock-data.ts` (add QueueAgent + QUEUE_AGENTS)
  - `src/app/dashboard/service-request/[id]/page.tsx` (full rewrite)
- Next: Implementasi aksi nyata (Change Status, Assign) via API. Buat halaman create service request.

## 2026-05-30 - Service Request Detail Page

- Area: frontend
- Summary: Develop halaman detail service request (`/dashboard/service-request/[id]`):
  - Buat shared mock data di `src/features/service-request/mock-data.ts` dengan field baru: `subject`, `status`, `assignedTo`, `description`, `customerEmail`, `updatedAt`, `comments`, `activityLog`.
  - Update halaman list: ganti mock data lokal dengan shared data, tambah kolom `Status` (sortable), baris tabel kini clickable → navigate ke detail, tambah subject di bawah customer name.
  - Buat detail page dengan layout 2-kolom: kiri (description + comments thread + comment input), kanan (ticket info card: customer, category, assignee, timestamps, SLA progress bar + remaining time, activity log).
  - Status badge berwarna: Open (blue), In Progress (violet), Pending (amber), Resolved (emerald), Closed (zinc).
- Files:
  - `src/features/service-request/mock-data.ts` (new)
  - `src/app/dashboard/service-request/page.tsx` (edited)
  - `src/app/dashboard/service-request/[id]/page.tsx` (new)
- Next: Implementasi aksi nyata (Change Status, Assign, Add Comment) — integrate dengan API / state management.

Tujuan: catatan perubahan harian untuk frontend, backend, database, dan dokumentasi.

## Log Template

Copy format berikut untuk setiap update:

---

## 2026-05-30 - Fix Custom Date Picker Range Selection UX

- Area: frontend
- Summary: Mengubah logic UX pada date picker agar lebih intuitif seperti standar picker modern: 
  - Pilih tanggal tidak dibatasi disabled range.
  - Klik pertama selalu menjadi Start Date, klik kedua menjadi End Date (berlaku di kedua picker box).
  - Jika End Date lebih awal dari Start Date, otomatis ditukar (swap) agar menjadi range yang valid.
  - DayPicker diubah menggunakan `mode="range"` agar indikator range (`range_middle`) muncul dengan sempurna di UI.
  - Menyesuaikan CSS override di class DayPicker (`.rdp-day_range_middle`) untuk benar-benar menghilangkan lingkaran border/background di hari-hari antara start dan end date, membuat start dan end date tetap ter-highlight proporsional.
  - Fix issue di mana "Apply range" modal tidak bisa ditutup: Menghapus pengecekan manual `.getTime()` yang conflict pada button disabled, dan menambahkan tag `type="button"` + `preventDefault()` agar event click merender ulang state yang di-set dan tidak diintercept behavior default form/button.
- Files:
  - `src/app/dashboard/page.tsx`
- Next: Integrasi fetching data chart/overview berdasarkan parameter custom date tersebut.

---

## 2026-05-30 - Dashboard Custom Date Picker UX Fix

- Area: frontend
- Summary: Perbaikan 3 UX issue pada custom date range picker di halaman Overview dashboard:
  1. Tambah `disabled={{ after: customEndDate }}` di start picker dan `disabled={{ before: customStartDate }}` di end picker — user tidak bisa pilih tanggal yang invalid secara visual.
  2. Tambah `useRef` + `useEffect` mousedown untuk deteksi klik di luar picker → otomatis tutup modal.
  3. Ganti `defaultMonth` (uncontrolled) dengan `month` + `onMonthChange` (controlled) di kedua DayPicker — navigasi kalender independent dan reliable, termasuk untuk range dalam 1 bulan yang sama.
  4. Tombol "Apply range" di-disable secara visual jika range tidak valid.
- Files:
  - src/app/dashboard/page.tsx
- Next: Integrasi data riil berdasarkan rentang tanggal yang dipilih.

---

## 2026-05-27 - Service Request Module

- Area: frontend
- Summary: Buat halaman Service Request di dashboard dengan tabel berisi ticket number, customer name, category, priority (SLA badge), dan due date dengan indikator Breached. Ganti sidebar item Inbox → Service Request.
- Files:
  - src/app/dashboard/service-request/page.tsx (new)
  - src/app/dashboard/layout.tsx (sidebar: Inbox → Service Request)
- Notes: SLA logic — Low 24h, Medium 12h, High 8h. Breached jika `now > dueDate`. Data masih mock.
- Next: Integrasi API service request, tambah filter status & pagination.

---

```md
## YYYY-MM-DD - <Nama>

- Area: frontend | backend | database | docs
- Summary: ringkasan perubahan
- Files:
	- path/file-a
	- path/file-b
- Notes: kendala/keputusan penting
- Next: langkah berikutnya
```

## 2026-05-24 - Copilot

- Area: frontend, docs
- Summary: inisialisasi project Next.js Ticketin, setup shadcn/lucide/animate-ui, implement landing page awal, tambah aturan kerja & governance docs.
- Files:
	- src/app/page.tsx
	- src/app/layout.tsx
	- src/app/globals.css
	- .github/prompts/bootstrap-ticketin.prompt.md
	- .github/copilot-instructions.md
	- docs/rules/readme.md
	- docs/daily progress/readme.md
	- docs/api testing/asyncapi.yaml
	- README.md
- Notes: build berhasil; struktur modul awal untuk fitur lanjutan sudah disiapkan.
- Next: mulai modul auth register/login + dokumentasi API auth.

## 2026-05-24 - GitHub Copilot

- Area: frontend
- Summary: Revamp landing page 100% dengan desain minimalist-modern, tema warna merah (primary), grid-pattern background, dan animasi transisi pada icon.
- Files:
	- src/app/page.tsx
- Notes: Menggunakan variabel `primary` (Oklch) agar konsisten dengan tema dark/light mode; menghapus hardcoded color hex; optimasi spacing dan tipografi (Space Grotesk).
- Next: Lanjut ke modul Auth (Register/Login).

## 2026-05-24 - GitHub Copilot

- Area: frontend
- Summary: Expansion and localization of landing page to English. Added social proof, interactive workflow visualization, and multiple new sections. Implemented advanced animations (pulse-slow, fade-in, staggered rise).
- Files:
	- src/app/page.tsx
	- src/app/globals.css
- Notes: Switched all wording to English. Integrated `animate-pulse-slow` for background glow and `animate-fade-in` for nav. Used `lucide-react` for enhanced visual storytelling.
- Next: Transition to Auth module (Register/Login) documentation and implementation.

## 2026-05-26 - GitHub Copilot

- Area: frontend
- Summary: Refined landing page UI based on specific design feedback. Updated logo to Ticket icon, simplified hero header, implemented infinite logo carousel, expanded dashboard metrics, and replaced grid feature cards with a split-section vertical layout. Replaced footer CTA with a 3-card subscription-based pricing model and updated credits.
- Files:
	- src/app/page.tsx
	- src/app/globals.css
- Notes: Used `animate-scroll-left` for the brand carousel. Implemented a more detailed dashboard mockup including SLA breaches and systems health. Credits updated to point to yourin.my.id.
- Next: Finalize any UI tweaks then move to Auth documentation.

## 2026-05-26 - GitHub Copilot

- Area: frontend
- Summary: Refined Feature sections by removing category badges (Bank-grade Security, etc.) and updating placeholder list items with actual descriptive feature points.
- Files:
	- src/app/page.tsx
- Notes: Improved content clarity in the vertical split sections.
- Next: Move to Auth module implementation.

## 2026-05-26 - GitHub Copilot

- Area: frontend, docs
- Summary: Implemented Auth module (Login & Signup pages) and linked all landing page CTAs to the new auth routes. Created comprehensive auth specifications.
- Files:
	- src/app/auth/login/page.tsx
	- src/app/auth/signup/page.tsx
	- src/app/page.tsx
	- src/components/ui/input.tsx
	- src/components/ui/label.tsx
	- docs/api documentation/auth.md
- Notes: Used Radix UI for Label. Linked "Get Started", "Start Free", and "Log in" buttons to their respective routes. Auth pages follow the clean red minimalist theme.
- Next: Implement Auth API endpoints (backend) or move to Contact module.

## 2026-05-26 - GitHub Copilot

- Area: frontend
- Summary: Implemented comprehensive Dashboard module including Layout with Sidebar/Navbar and Overview page.
- Files:
	- src/app/dashboard/layout.tsx
	- src/app/dashboard/page.tsx
- Notes: Used Lucide icons extensively for a "icon-first" modern look. Implemented local dark mode toggle, profile dropdown, and detailed metric cards (New, In Progress, Resolved, Closed). Added sections for Customer Satisfaction (CSAT) and SLA Performance (Circle Progress). 
- Next: Move to Contact or Queue module frontend implementation.

## 2026-05-26 - GitHub Copilot

- Area: frontend, docs
- Summary: Fixed dashboard runtime error by importing `useState` in the overview page.
- Files:
	- src/app/dashboard/page.tsx
	- docs/daily progress/readme.md
- Notes: The page was failing at runtime because the hook was referenced without an import.
- Next: Re-run the dashboard route and continue with any remaining frontend issues.

## 2026-05-26 - GitHub Copilot

- Area: frontend, docs
- Summary: Restored dashboard sidebar rendering, wired the overview filter to period-specific data, and added a frontend-only My Account page for profile, email, and password editing.
- Files:
	- src/app/dashboard/layout.tsx
	- src/app/dashboard/page.tsx
	- src/app/dashboard/account/page.tsx
	- docs/daily progress/readme.md
- Notes: Filter tabs now change the visible metrics and CSAT/SLA values; account screen includes name, photo preview, email, and password fields without backend persistence.
- Next: Hook these forms to real endpoints later when the backend is ready.

## 2026-05-26 - GitHub Copilot

- Area: frontend, docs
- Summary: Fixed the dashboard date filter tabs to a fixed width and added a custom date-range modal with side-by-side start/end calendars using react-day-picker.
- Files:
	- src/app/dashboard/page.tsx
	- package.json
	- package-lock.json
	- docs/daily progress/readme.md
- Notes: Start and end dates now constrain each other so invalid ranges cannot be chosen.
- Next: If needed, apply the same date-range pattern to other dashboard views.

## 2026-05-26 - GitHub Copilot

- Area: frontend, docs
- Summary: Switched the Today label to a same-day date range and removed forced tab width so the date filter layout follows content naturally.
- Files:
	- src/app/dashboard/page.tsx
	- docs/daily progress/readme.md
- Notes: The date pill now stays on one line while using the actual date-range text for each filter.
- Next: Recheck the dashboard spacing in the browser after the label change.

## 2026-06-02 - Reusable Layout Shell Components (Spacing Standardization)

- Area: frontend
- Summary: Created `PageShell` and `DetailShell` layout wrapper components to standardize page spacing across all dashboard pages. Source of truth is `/dashboard/service-request` (`p-6 space-y-6`). Migrated all index/table pages to `<PageShell>` and all detail/form pages to `<DetailShell maxWidth="...">`. Removed inconsistent `mb-6`, `space-y-5`, and standalone `p-6` root divs.
- Files:
  - `src/components/layouts/page-shell.tsx` (new — PageShell + DetailShell)
  - `src/app/dashboard/service-request/page.tsx`
  - `src/app/dashboard/service-request/new/page.tsx`
  - `src/app/dashboard/service-request/[id]/page.tsx`
  - `src/app/dashboard/contact/page.tsx`
  - `src/app/dashboard/contact/[id]/page.tsx`
  - `src/app/dashboard/settings/email-templates/page.tsx`
  - `src/app/dashboard/settings/email-templates/[id]/page.tsx`
  - `src/app/dashboard/settings/knowledge/page.tsx`
  - `src/app/dashboard/settings/knowledge/[id]/page.tsx`
  - `src/app/dashboard/settings/csat/page.tsx`
  - `src/app/dashboard/user-management/page.tsx`
  - `src/app/dashboard/user-management/users/[id]/page.tsx`
  - `src/app/dashboard/user-management/queue/[id]/page.tsx`
- Next: Continue roadmap — queue and service request backend integration.
