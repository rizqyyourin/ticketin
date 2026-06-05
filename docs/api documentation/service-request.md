# Docs Specification - Service Request

Modul Service Request memungkinkan agent mengelola tiket dukungan pelanggan. Agent dapat membuat tiket baru, melihat daftar tiket, mengubah status, menugaskan agent, dan menambahkan komentar. Tiket terhubung ke Contact (customer) yang sudah ada di sistem.

**Version:** 1.0.0  
**Owner:** Rizqy Yourin  
**Last Updated:** 2026-06-02

---

## Service Request - Create

### Objectives

- Agent dapat membuat tiket baru dengan memilih contact yang sudah ada.
- Tiket otomatis mendapat `ticketNumber` (SR0001, SR0002, ...) dan SLA deadline berdasarkan priority.

### Assumptions and Constraints

- `contactId` wajib — customer harus sudah ada di modul Contact.
- Status awal selalu `open`.
- `ticketNumber` di-generate server-side (`SRxxxx`, increment dari count).
- SLA: low=24h, medium=12h, high=8h dari `createdAt`.

### Actors and Permissions

| Actor/Role | Permissions |
| --- | --- |
| Agent | Create ticket untuk contact existing. |
| Supervisor | Create ticket + assign langsung saat create. |

### User Flow (Main)

```mermaid
graph TD
    A[Buka /service-request/new] --> B[Fetch contacts + users]
    B --> C[Pilih customer dari datalist]
    C --> D[Email auto-fill]
    D --> E[Isi subject, description, category, priority]
    E --> F[Pilih assign optional]
    F --> G{Valid?}
    G -->|No| H[Show validation errors]
    G -->|Yes| I[POST /api/service-requests]
    I --> J[201 Created]
    J --> K[Redirect ke detail page]
```

### Error and Validation Flow

```mermaid
graph TD
    A[Submit] --> B{contactId ada?}
    B -->|No| C[Show: Select an existing contact]
    B -->|Yes| D{subject ada?}
    D -->|No| E[Show: Subject is required]
    D -->|Yes| F{description ada?}
    F -->|No| G[Show: Description is required]
    F -->|Yes| H[POST /api/service-requests]
    H -->|Error| I[Show error banner]
    H -->|OK| J[Redirect]
```

### Sequence Diagram - Create

```mermaid
sequenceDiagram
    actor Agent
    participant UI
    participant API
    participant DB

    Agent->>UI: Open /service-request/new
    UI->>API: GET /api/contacts
    UI->>API: GET /api/users
    API->>DB: Fetch contacts, users
    DB-->>API: Data
    API-->>UI: contacts[], users[]
    Agent->>UI: Fill form + submit
    UI->>API: POST /api/service-requests
    API->>DB: count() untuk ticketNumber
    API->>DB: serviceRequest.create() + activityLog.create()
    DB-->>API: New record
    API-->>UI: 201 + ticket payload
    UI-->>Agent: Redirect ke /service-request/:id
```

### API Endpoint - Create

**`POST /api/service-requests`**

Request body:
```json
{
  "subject": "Cannot login to application",
  "description": "User cannot login since yesterday...",
  "category": "Technical Support",
  "priority": "high",
  "contactId": "clx...",
  "assignedTo": "clx...",
  "dueDate": "2026-06-03T06:00:00.000Z"
}
```

Response `201 Created`:
```json
{
  "id": "clx...",
  "ticketNumber": "SR0003",
  "status": "open",
  "contact": { ... },
  "activityLogs": [{ "type": "created", ... }]
}
```

### Acceptance Criteria

1. Tiket baru muncul di list page setelah create.
2. `ticketNumber` format `SR` + 4 digit zero-padded.
3. `activityLog` entry `created` otomatis terbuat.
4. Validasi: contactId wajib dari existing contacts.

---

## Service Request - Update (Status & Assignment)

### Objectives

- Agent mengubah status tiket mengikuti state machine yang terdefinisi.
- Agent/Supervisor menugaskan tiket ke user tertentu.

### Actors and Permissions

| Actor/Role | Permissions |
| --- | --- |
| Agent | Change status, assign (jika punya akses). |
| Supervisor | Change status, assign ke siapa saja. |

### Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> open: Create
    open --> in_progress: Pick up
    open --> closed: Force close
    in_progress --> pending: Await customer
    in_progress --> resolved: Issue fixed
    in_progress --> closed: Force close
    pending --> in_progress: Customer replied
    pending --> closed: No response
    resolved --> closed: Customer confirmed
    closed --> [*]: Terminal
```

### Sequence Diagram - Update Status

```mermaid
sequenceDiagram
    actor Agent
    participant UI
    participant API
    participant DB

    Agent->>UI: Click "Change Status"
    UI-->>Agent: Modal dengan opsi transisi valid
    Agent->>UI: Pilih status baru
    UI->>API: PATCH /api/service-requests/:id
    Note right of API: body: { status: "in_progress" }
    API->>DB: findUnique (current status)
    API->>DB: update status + create activityLog
    DB-->>API: Updated record
    API-->>UI: 200 + updated ticket
    UI-->>Agent: Status badge berubah, activity log append
```

### Sequence Diagram - Assign

```mermaid
sequenceDiagram
    actor Agent
    participant UI
    participant API
    participant DB

    Agent->>UI: Click "Assign"
    UI->>API: GET /api/users
    API-->>UI: users[]
    Agent->>UI: Pilih agent
    UI->>API: PATCH /api/service-requests/:id
    Note right of API: body: { assignedTo: "userId" }
    API->>DB: findUnique user (username lookup)
    API->>DB: update assignedTo + create activityLog
    DB-->>API: Updated record
    API-->>UI: 200 OK
    UI-->>Agent: "Assigned To" info berubah
```

### API Endpoint - Update

**`PATCH /api/service-requests/:id`**

Request body (partial — semua field optional):
```json
{
  "status": "in_progress",
  "assignedTo": "clx..."
}
```

Response `200 OK` — full ticket dengan contact + assignedUser.

---

## Service Request - Comment

### API Endpoint - Add Comment

**`POST /api/service-requests/:id/comments`**

Request body:
```json
{
  "content": "I have reviewed your issue and will investigate.",
  "role": "agent"
}
```

Response `201 Created`:
```json
{
  "id": "clx...",
  "content": "...",
  "role": "agent",
  "createdAt": "...",
  "author": { "username": "rizky.a" }
}
```

Side effect: `activityLog` entry `comment` otomatis terbuat.

---

## Shared Diagrams and References

### Data Model (ERD)

```mermaid
erDiagram
    ServiceRequest ||--|| Contact : "belongs to"
    ServiceRequest ||--o| User : "assigned to"
    ServiceRequest ||--o| Queue : "in queue"
    ServiceRequest ||--o{ Comment : has
    ServiceRequest ||--o{ ActivityLog : has
    ServiceRequest {
        string id PK
        string ticketNumber UK
        string subject
        text description
        string category
        Priority priority
        Status status
        datetime dueDate
        datetime createdAt
        datetime updatedAt
    }
    Comment {
        string id PK
        text content
        CommentRole role
        string serviceRequestId FK
        string authorId FK
        datetime createdAt
    }
    ActivityLog {
        string id PK
        ActivityLogType type
        string detail
        string serviceRequestId FK
        string actorId FK
        datetime createdAt
    }
```

### Status Enum

| Value | Label | Color |
|---|---|---|
| `open` | Open | Blue |
| `in_progress` | In Progress | Violet |
| `pending` | Pending | Amber |
| `resolved` | Resolved | Emerald |
| `closed` | Closed | Zinc |

### Priority & SLA

| Priority | SLA Hours |
|---|---|
| `high` | 8h |
| `medium` | 12h |
| `low` | 24h |

### Edge Cases

- Contact tidak ditemukan saat create → validasi FE, link ke `/contact`
- Status `closed` → terminal, tidak bisa transisi
- Unassign: kirim `{ assignedTo: null }` ke PATCH
- Comment oleh customer (`role: "customer"`) → untuk future email webhook integration

### Observability

- Setiap perubahan status: `ActivityLog` entry `status_change`
- Setiap assign/unassign: `ActivityLog` entry `assignment`
- Setiap comment: `ActivityLog` entry `comment`
- Create: `ActivityLog` entry `created` (di-create dalam satu transaction saat POST)

---

## Change Log

| Date | Author | Change |
| --- | --- | --- |
| 2026-06-02 | Rizqy | Initial draft — backend integration complete. |
