# Docs Specification - Feature

Summary of the feature in 3-6 sentences. Include user goal, business value, and scope boundaries.

**Version:** 0.1.0  
**Owner:** <name>  
**Last Updated:** YYYY-MM-DD

## <Feature Name> - Create

### Objectives

- Objective 1 (measurable outcome).
- Objective 2 (measurable outcome).

### Assumptions and Constraints

- Assumption or dependency.
- Technical or compliance constraint.

### Actors and Permissions

| Actor/Role | Permissions |
| --- | --- |
| Agent | Describe allowed actions. |
| Supervisor | Describe allowed actions. |

### User Flow (Main)

Purpose: Primary user journey from entry to completion, focused on the happy path and key decisions.

```mermaid
graph TD
    A[Entry Point] --> B[Open Feature]
    B --> C[Fill Required Fields]
    C --> D{Valid Input?}
    D -->|Yes| E[Submit]
    D -->|No| F[Show Validation Errors]
    F --> C
    E --> G[Success Response]
    G --> H[Redirect or Show Result]
```

### Error and Validation Flow

Purpose: Validation, permission, and system error paths, including user feedback and recovery behavior.

```mermaid
graph TD
    A[Submit Action] --> B{Permission OK?}
    B -->|No| C[Show Access Denied]
    B -->|Yes| D{Validation OK?}
    D -->|No| E[Highlight Invalid Fields]
    D -->|Yes| F{API Success?}
    F -->|No| G[Show Error Message]
    F -->|Yes| H[Continue Success Flow]
```

### Sequence Diagram - Create

Purpose: UI to API interactions for the create flow, including lookup calls and record insertion.

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant API
    participant DB

    User->>UI: Open create form
    UI->>API: GET /resource/options
    API->>DB: Fetch lookup data
    DB-->>API: Lookup data
    API-->>UI: Options payload
    User->>UI: Submit form
    UI->>API: POST /resource
    API->>DB: Insert record
    DB-->>API: New record id
    API-->>UI: 201 Created + payload
    UI-->>User: Show success state
```

### Acceptance Criteria

1. User can complete the main flow without errors.
2. Validation messages appear for missing or invalid fields.
3. Successful submission produces the expected result.

## <Feature Name> - Update

### Objectives

- Objective 1 (measurable outcome).
- Objective 2 (measurable outcome).

### Assumptions and Constraints

- Assumption or dependency.
- Technical or compliance constraint.

### Actors and Permissions

| Actor/Role | Permissions |
| --- | --- |
| Agent | Describe allowed actions. |
| Supervisor | Describe allowed actions. |

### User Flow (Main)

```mermaid
graph TD
    A[Entry Point] --> B[Open Feature]
    B --> C[Fill Required Fields]
    C --> D{Valid Input?}
    D -->|Yes| E[Submit]
    D -->|No| F[Show Validation Errors]
    F --> C
    E --> G[Success Response]
    G --> H[Redirect or Show Result]
```

### Sequence Diagram - Update

Purpose: UI to API interactions for update flow, including permission checks and side effects.

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant API
    participant DB

    User->>UI: Open detail page
    UI->>API: GET /resource/{id}
    API->>DB: Fetch record
    DB-->>API: Record data
    API-->>UI: Record payload
    User->>UI: Edit fields
    UI->>API: PATCH /resource/{id}
    API->>DB: Update record
    DB-->>API: Updated record
    API-->>UI: 200 OK + payload
    UI-->>User: Show updated state
```

### Acceptance Criteria

1. User can complete the main flow without errors.
2. Validation messages appear for missing or invalid fields.
3. Successful submission produces the expected result.

## Shared Diagrams and References

### Error and Validation Flow

Purpose: Validation, permission, and system error paths, including user feedback and recovery behavior.

```mermaid
graph TD
    A[Submit Action] --> B{Permission OK?}
    B -->|No| C[Show Access Denied]
    B -->|Yes| D{Validation OK?}
    D -->|No| E[Highlight Invalid Fields]
    D -->|Yes| F{API Success?}
    F -->|No| G[Show Error Message]
    F -->|Yes| H[Continue Success Flow]
```

### Data Model (ERD)

Purpose: Tables, relations, and key constraints required by this feature.

```mermaid
erDiagram
    FEATURE ||--o{ FEATURE_LOG : has
    FEATURE {
        uuid id PK
        varchar title
        text description
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }
    FEATURE_LOG {
        uuid id PK
        uuid feature_id FK
        varchar action
        text details
        timestamptz created_at
    }
```

### API Contract Reference

| No | File | Description |
| --- | --- | --- |
| 1 | [contract-api/feature-openapi.yaml](contract-api/feature-openapi.yaml) | OpenAPI spec for endpoints, schemas, and errors. |

### Mock Data Reference

| No | File | Description |
| --- | --- | --- |
| 1 | [mockoon/feature-mock.json](mockoon/feature-mock.json) | Mock endpoints and sample payloads. |

### State or Status Lifecycle (Optional)

Describe status transitions and any SLA rules.

### Edge Cases

- Duplicate submissions
- Partial failures or retries
- Permission edge cases

### Observability

- Logs required
- Audit trail events
- Metrics/alerts

## Change Log

| Date | Author | Change |
| --- | --- | --- |
| YYYY-MM-DD | Name | Initial draft. |