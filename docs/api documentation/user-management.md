# User Management Module — API Documentation

**Version:** 1.0.0  
**Status:** ✅ 100% Integrated (Frontend + Backend)  
**Last Updated:** 2026-06-02

---

## Overview

Modul User Management mengelola users, queues, dan roles beserta permissions-nya. Terdiri dari 3 sub-modul: Users, Queue, Roles.

---

## Sub-Module: Users

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List semua users |
| POST | `/api/users` | Buat user baru |
| GET | `/api/users/:id` | Detail user (include queue memberships) |
| PATCH | `/api/users/:id` | Update user (username, email, phone, status, roleId) |
| DELETE | `/api/users/:id` | Hapus user |

### Request Body — POST `/api/users`

```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "phone": "string (optional)",
  "roleId": "string (optional)",
  "status": "active | inactive (default: active)"
}
```

### Request Body — PATCH `/api/users/:id`

```json
{
  "username": "string",
  "email": "string",
  "phone": "string | null",
  "status": "active | inactive",
  "roleId": "string | null"
}
```

> Note: `password` field diabaikan di PATCH endpoint (stripped server-side).

### Response Shape — GET `/api/users`

```json
[
  {
    "id": "uuid",
    "userId": "USR-001",
    "username": "string",
    "email": "string",
    "phone": "string | null",
    "status": "active | inactive",
    "role": { "id": "uuid", "name": "string" } | null
  }
]
```

---

## Sub-Module: Queue

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/queues` | List semua queues (include members) |
| POST | `/api/queues` | Buat queue baru |
| GET | `/api/queues/:id` | Detail queue (include members) |
| PATCH | `/api/queues/:id` | Update queue (name, status, memberIds) |
| DELETE | `/api/queues/:id` | Hapus queue |

### Request Body — POST `/api/queues`

```json
{
  "name": "string (required)",
  "status": "active | inactive (default: active)",
  "memberIds": ["userId1", "userId2"]
}
```

### Request Body — PATCH `/api/queues/:id`

```json
{
  "name": "string",
  "status": "active | inactive",
  "memberIds": ["userId1", "userId2"]
}
```

> Note: `memberIds` jika disertakan akan **replace** semua member (deleteMany + createMany).

### Response Shape — GET `/api/queues`

```json
[
  {
    "id": "uuid",
    "queueId": "QUE-001",
    "name": "string",
    "status": "active | inactive",
    "members": [
      {
        "user": { "id": "uuid", "username": "string", "email": "string" }
      }
    ]
  }
]
```

---

## Sub-Module: Roles & Permissions

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | List semua roles |
| POST | `/api/roles` | Buat role baru |
| GET | `/api/roles/:id` | Detail role (include user count) |
| PATCH | `/api/roles/:id` | Update role (name, status, permissions) |
| DELETE | `/api/roles/:id` | Hapus role |

### Request Body — POST `/api/roles`

```json
{
  "name": "string (required)",
  "status": "active | inactive (default: active)",
  "permissions": {
    "Service Request": true,
    "Contact": false,
    "User Management": false,
    "Queue": false,
    "Dashboard": false,
    "Settings": false
  }
}
```

### Request Body — PATCH `/api/roles/:id`

```json
{
  "name": "string",
  "status": "active | inactive",
  "permissions": {
    "Service Request": true,
    "Contact": true
  }
}
```

### Permissions Format

Permissions disimpan sebagai JSON object dengan 6 module keys:

| Module Key | Description |
|-----------|-------------|
| `Service Request` | Akses modul service request |
| `Contact` | Akses modul contact |
| `User Management` | Akses modul user management |
| `Queue` | Akses modul queue |
| `Dashboard` | Akses modul dashboard |
| `Settings` | Akses modul settings |

### Response Shape — GET `/api/roles`

```json
[
  {
    "id": "uuid",
    "roleId": "ROLE-001",
    "name": "string",
    "status": "active | inactive",
    "permissions": {
      "Service Request": true,
      "Contact": true,
      "User Management": true,
      "Queue": true,
      "Dashboard": true,
      "Settings": true
    }
  }
]
```

---

## Frontend Features

| Feature | Status |
|---------|--------|
| List users/queues/roles dengan sort & search | ✅ Done |
| Create user (dengan password + role picker) | ✅ Done |
| Create queue (dengan member picker) | ✅ Done |
| Create role (dengan permission matrix) | ✅ Done |
| Edit user/queue/role via modal | ✅ Done |
| Toggle status active/inactive (clickable badge) | ✅ Done |
| Add/remove queue members | ✅ Done |
| Edit role permissions via modal | ✅ Done |
| Sidebar permissions update real-time | ✅ Done |
| Toast success/error feedback | ✅ Done |

---

## Actors & Permissions

| Actor | Akses |
|-------|-------|
| Admin | Full CRUD semua sub-modul |
| Supervisor | Read-only (bergantung permission role) |
| Agent | Tidak ada akses (bergantung permission role) |

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Unauthorized — session tidak valid |
| 404 | Resource tidak ditemukan |
| 400 | Validasi gagal (e.g. nama kosong, email duplikat) |
| 500 | Internal server error |
