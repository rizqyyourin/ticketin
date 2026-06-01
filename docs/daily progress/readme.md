# Daily Progress Log

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
