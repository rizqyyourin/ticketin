# Docs Specification - Customer Support Ticket Management

The Customer Support Ticket Management feature powers Ticketin's email-first CRM workflow by managing customer support inquiries, queue routing, agent assignments, comment threading, activity auditing, and Customer Satisfaction (CSAT) surveys. Built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, and Prisma ORM, it parses inbound customer email webhooks (`/api/inbound`) into tracked service requests (`SR0001`) with unique `emailThreadId` anchors. Scope covers ticket creation, queue routing, status transitions (`new` -> `open` -> `in_progress` -> `pending` -> `resolved` -> `closed`), priority assignment (`low`, `medium`, `high`), agent commenting, activity logging, knowledge base linking, and CSAT survey generation.

**Version:** 0.1.0  
**Owner:** Rizqy  
**Last Updated:** 2026-07-27

## Customer Support Ticket Management - Create

### Objectives

- Ingest customer support inquiries via API (`POST /api/service-requests`) or email webhook (`POST /api/inbound`) and generate a service request (`SR0001`) within 3 seconds.
- Automatically link or create `Contact` records, assign initial status `new`, assign queue routing, and log `ActivityLog` type `created`.

### Assumptions and Constraints

- Customer email must be valid and linked to a `Contact` record.
- Default queues and priority levels (`medium` default) must be configured in system database.
- Unique `ticketNumber` sequence (e.g. `SR0001`) generated atomically.

### Actors and Permissions

| Actor/Role | Permissions |
| --- | --- |
| Admin / Supervisor | Full access: `tickets.create`, `tickets.view`, `tickets.edit`, `tickets.delete`, `tickets.assign`, `queues.manage`, `rbac.manage` |
| Agent | `tickets.create`, `tickets.view`, `tickets.edit`, `comments.create`, `knowledge.view` |
| Customer / Inbound Email | Can trigger ticket creation via contact form or inbound email webhook |

### User Flow (Main)

Purpose: Primary user journey from entry to completion, focused on the happy path and key decisions.

```mermaid
graph TD
    A["Support Portal / Inbound Email"] --> B["Open Create Ticket Form or Send Email"]
    B --> C["Fill Customer Details, Category, Subject & Description"]
    C --> D{"Valid Email & Form Input?"}
    D -->|Yes| E["POST /api/service-requests or /api/inbound"]
    D -->|No| F["Show Validation Errors on Form"]
    F --> C
    E --> G["Find/Create Contact Record & Generate Ticket Number SR0001"]
    G --> H["Save ServiceRequest, Log Activity 'created' & Return Confirmation"]
```

### Error and Validation Flow

Purpose: Validation, permission, and system error paths, including user feedback and recovery behavior.

```mermaid
graph TD
    A["Submit Service Request Action"] --> B{"Valid Session or API Secret?"}
    B -->|No| C["Return 401 Unauthorized / 403 Forbidden"]
    B -->|Yes| D{"Mandatory Fields Present (Subject/Description/Email)?"}
    D -->|No| E["Return 400 Bad Request with Missing Field Details"]
    D -->|Yes| F{"Contact Email Lookup Success?"}
    F -->|No| G["Auto-Create New Contact Record"]
    F -->|Yes| H["Link Existing Contact ID"]
    G --> I["Insert ServiceRequest & Log Activity"]
    H --> I
```

### Sequence Diagram - Create

Purpose: UI to API interactions for the create flow, including lookup calls and record insertion.

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant API
    participant DB

    User->>UI: Fill ticket form (Customer Name, Email, Category, Subject, Description)
    UI->>API: GET /api/queues
    API->>DB: Fetch active queues (QUE-001)
    DB-->>API: Active queue dataset
    API-->>UI: Populate Queue & Category dropdowns
    User->>UI: Click Submit Ticket
    UI->>API: POST /api/service-requests
    API->>DB: Upsert Contact record by email
    API->>DB: Generate next ticket number (SR0001)
    API->>DB: Insert ServiceRequest (status: new, priority: medium)
    API->>DB: Insert ActivityLog (type: created)
    DB-->>API: Created ServiceRequest model
    API-->>UI: 201 Created + Ticket payload
    UI-->>User: Display success toast & redirect to ticket detail /dashboard/service-requests/SR0001
```

### Acceptance Criteria

1. Submitting the ticket form or sending an email parses details, upserts `Contact`, and creates a `ServiceRequest` with number `SR0001`.
2. Missing email or subject fields returns a `400 Bad Request` with field error descriptions.
3. Creation logs an `ActivityLog` entry (`type: created`) and sets initial status to `new`.

## Customer Support Ticket Management - Update

### Objectives

- Support ticket status transitions (`new` -> `open` -> `in_progress` -> `pending` -> `resolved` -> `closed`), agent reassignment, and comment threading.
- Generate CSAT survey tokens (`csatToken`) automatically upon transitioning status to `resolved` or `closed` and send survey invitation emails.

### Assumptions and Constraints

- Only assigned agents or supervisors with `tickets.edit` permission can update ticket status or assign agents.
- Resolved or closed tickets trigger CSAT survey token generation (`CsatSurvey`).

### Actors and Permissions

| Actor/Role | Permissions |
| --- | --- |
| Admin / Supervisor | Reassign queues/agents, override status, modify due dates, view activity logs |
| Agent | Update status (`in_progress`, `resolved`), post agent comments, log internal notes |
| Customer | Add customer comments via email reply, submit CSAT survey rating (`dissatisfied`, `neutral`, `satisfied`) |

### User Flow (Main)

```mermaid
graph TD
    A["Ticket Detail Page /dashboard/service-requests/SR0001"] --> B{"Select Update Action: Reply / Status / Assign"}
    B -->|Agent Reply| C["Type Comment & Click Send Reply"]
    B -->|Change Status| D["Select New Status (in_progress / resolved)"]
    B -->|Reassign Agent| E["Select Queue or Agent from Dropdown"]
    C --> F["POST /api/service-requests/id/comments"]
    D --> G["PATCH /api/service-requests/id"]
    E --> G
    F --> H["Save Comment, Update Threading & Log Activity 'comment'"]
    G --> I["Update ServiceRequest Status/AssignedTo & Log Activity 'status_change'"]
    I --> J{"New Status === resolved?"}
    J -->|Yes| K["Generate CSAT Token & Dispatch CSAT Survey Email"]
    J -->|No| L["Render Updated Ticket Detail Timeline"]
    K --> L
```

### Sequence Diagram - Update

Purpose: UI to API interactions for update flow, including permission checks and side effects.

```mermaid
sequenceDiagram
    actor Agent
    participant UI
    participant API
    participant DB

    Agent->>UI: Open ticket detail view /dashboard/service-requests/SR0001
    UI->>API: GET /api/service-requests/SR0001
    API->>DB: Query ServiceRequest with Contact, AssignedUser, Queue, Comments, ActivityLogs
    DB-->>API: Ticket complete payload
    API-->>UI: Render conversation timeline & agent action panel
    Agent->>UI: Post comment & change status to resolved
    UI->>API: POST /api/service-requests/SR0001/comments
    API->>DB: Insert Comment (role: agent)
    API->>DB: Insert ActivityLog (type: comment)
    UI->>API: PATCH /api/service-requests/SR0001
    API->>DB: Update ServiceRequest status to resolved & generate csatToken
    API->>DB: Insert ActivityLog (type: status_change, detail: "Status changed to resolved")
    DB-->>API: Updated ticket record
    API-->>UI: 200 OK + Updated ticket payload
    UI-->>Agent: Display resolved status badge & update timeline
```

### Acceptance Criteria

1. Agents can post replies (`Comment` role: `agent`) and update ticket status (`in_progress`, `resolved`, `closed`).
2. Status changes and agent assignments generate immutable `ActivityLog` records (`status_change`, `assignment`).
3. Marking a ticket as `resolved` generates a unique `csatToken` for customer feedback.

## Shared Diagrams and References

### Error and Validation Flow

Purpose: Validation, permission, and system error paths, including user feedback and recovery behavior.

```mermaid
graph TD
    A["Submit Action"] --> B{"Session Authenticated?"}
    B -->|No| C["Return 401 Unauthorized"]
    B -->|Yes| D{"Role Permissions Check OK?"}
    D -->|No| E["Return 403 Forbidden Access Denied"]
    D -->|Yes| F{"Validation OK?"}
    F -->|No| G["Return 400 Validation Error"]
    F -->|Yes| H["Execute Database Transaction & Return Success"]
```

### Data Model (ERD)

Purpose: Tables, relations, and key constraints required by this feature.

```mermaid
erDiagram
    User ||--o{ ServiceRequest : assignedAgent
    Contact ||--o{ ServiceRequest : raises
    Queue ||--o{ ServiceRequest : queuedIn
    Role ||--o{ User : definesRole
    User ||--o{ QueueMember : belongsTo
    Queue ||--o{ QueueMember : contains
    ServiceRequest ||--o{ Comment : contains
    ServiceRequest ||--o{ ActivityLog : tracks
    ServiceRequest ||--o| CsatSurvey : evaluates
    User ||--o{ KnowledgeArticle : authors

    User {
        string id PK
        string userId UK
        string username UK
        string email UK
        enum status "active,inactive"
        string roleId FK
        datetime createdAt
        datetime updatedAt
    }

    Role {
        string id PK
        string roleId UK
        string name UK
        json permissions
        enum status "active,inactive"
        datetime createdAt
        datetime updatedAt
    }

    Queue {
        string id PK
        string queueId UK
        string name UK
        enum status "active,inactive"
        datetime createdAt
        datetime updatedAt
    }

    Contact {
        string id PK
        enum title "Mr,Ms"
        string customerName
        string email UK
        string phone
        string organization
        datetime createdAt
        datetime updatedAt
    }

    ServiceRequest {
        string id PK
        string ticketNumber UK
        string subject
        text description
        string category
        enum priority "low,medium,high"
        enum status "new,open,in_progress,pending,resolved,closed"
        datetime dueDate
        string csatToken UK
        string contactId FK
        string assignedTo FK
        string queueId FK
        datetime createdAt
        datetime updatedAt
    }

    Comment {
        string id PK
        text content
        string authorId FK
        enum role "agent,customer,system"
        string serviceRequestId FK
        datetime createdAt
    }

    ActivityLog {
        string id PK
        enum type "created,status_change,assignment,comment"
        string detail
        string serviceRequestId FK
        string actorId FK
        datetime createdAt
    }

    CsatSurvey {
        string id PK
        string serviceRequestId FK
        enum rating "dissatisfied,neutral,satisfied"
        text comment
        datetime submittedAt
    }
```

### API Contract Reference

| No | File | Description |
| --- | --- | --- |
| 1 | [contract-api/feature-openapi.yaml](contract-api/feature-openapi.yaml) | OpenAPI spec for Ticketin service requests, comments, contacts, queues, and CSAT endpoints. |

### Mock Data Reference

| No | File | Description |
| --- | --- | --- |
| 1 | [mockoon/feature-mock.json](mockoon/feature-mock.json) | Mock endpoints and sample JSON payloads for Ticketin tickets, queues, and activity logs. |

### State or Status Lifecycle (Optional)

Service Requests follow the status lifecycle: `new` -> `open` -> `in_progress` -> `pending` -> `resolved` -> `closed`. CSAT surveys trigger automatically upon entering `resolved` or `closed` state.

### Edge Cases

- **Duplicate Email Inbound Webhook**: Concurrent customer emails creating duplicate contacts are prevented via Prisma `upsert` by unique email.
- **Unassigned Queue Routing**: Tickets created without a specified queue are auto-assigned to the default general support queue.
- **CSAT Double Submission**: Re-submitting a CSAT survey token returns a 409 Conflict if `CsatSurvey` already exists for `serviceRequestId`.

### Observability

- **Activity Log Audit Trail**: Every status change, assignment, creation, or comment generates an immutable `ActivityLog` entry with `actorId` and timestamp.
- **CSAT Rating Metrics**: Aggregated CSAT satisfaction ratings (`dissatisfied`, `neutral`, `satisfied`) monitored on the main support dashboard.
- **Queue Member Tracking**: Membership mappings between users and queues tracked in `QueueMember` for agent workload metrics.

## Change Log

| Date | Author | Change |
| --- | --- | --- |
| 2026-07-27 | Rizqy | Updated specification after comprehensive audit of Ticketin Prisma schema, API routes, RBAC permissions, and CSAT workflows. |
