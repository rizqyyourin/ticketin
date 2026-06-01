# Ticketin

Ticketin adalah CRM ticketing untuk customer experience berbasis email-first workflow.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- animate-ui

## Menjalankan Project

```bash
npm install
npm run dev
```

App akan jalan di `http://localhost:3000`.

## Build dan Validasi

```bash
npm run lint
npm run build
```

## Struktur Dokumentasi

- Rules: `docs/rules/readme.md`
- API Documentation: `docs/api documentation/readme.md`
- API Testing/Contract: `docs/api testing/asyncapi.yaml`
- Daily Progress: `docs/daily progress/readme.md`

## Aturan Wajib Workflow

1. Setiap perubahan frontend/backend/database harus update daily progress.
2. Setiap perubahan API atau model data harus update docs API (flow, sequence, ERD jika terdampak).
3. Ikuti roadmap fase implementasi:
- landing page
- auth (register/login)
- contact
- queue
- service request
- dashboard
- roles & permission

## Struktur Fitur (In Progress)

- `src/features/auth`
- `src/features/contact`
- `src/features/queue`
- `src/features/service-request`
- `src/features/dashboard`
- `src/features/rbac`

## Catatan

Instruksi untuk AI/Copilot disimpan di `.github/copilot-instructions.md` agar rules project dijalankan sebelum menghasilkan perubahan.
