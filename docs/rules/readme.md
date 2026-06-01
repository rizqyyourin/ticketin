# Ticketin Rules

Tujuan: aturan kerja agar output AI konsisten, terdokumentasi, dan siap scale.

## Core Rules (Wajib)

1. Baca konteks dulu sebelum ngoding.
2. Jangan ubah behavior existing tanpa alasan jelas.
3. Setiap perubahan frontend, backend, atau database harus update daily progress.
4. Semua endpoint baru/berubah wajib update docs API (flow, sequence, ERD jika terdampak).
5. Jangan commit hardcoded secret/token.
6. Untuk fitur baru, mulai dari requirement singkat lalu breakdown task.
7. Gunakan naming konsisten per modul (`auth`, `contact`, `queue`, `service-request`, `dashboard`, `rbac`).

## Documentation Rules

1. Dokumen spesifikasi fitur ditulis di folder `docs/api documentation/`.
2. Minimal isi dokumen fitur:
- Objective
- Actors & permission
- Main flow
- Error flow
- Sequence diagram
- ERD impact
- Acceptance criteria
3. Testing contract (asyncapi/openapi/mock) disimpan di `docs/api testing/`.

## Daily Progress Rules

1. Update file `docs/daily progress/readme.md` setiap kali ada perubahan.
2. Wajib mencatat:
- tanggal
- area (frontend/backend/database/docs)
- ringkasan perubahan
- file penting yang berubah
- next action
3. Satu perubahan kecil boleh diringkas, tapi jangan skip update.

## Definition of Done

1. Kode jalan di local (`npm run dev`) tanpa error blocking.
2. Lint/build tidak gagal untuk perubahan yang dibuat.
3. Dokumentasi API relevan sudah ter-update.
4. Daily progress sudah terisi.
