# Auth (Login & Signup) - Specification

This document defines the authentication flow for Ticketin, covering user registration and secure login.

**Version:** 0.1.0  
**Owner:** Yourin  
**Last Updated:** 2026-05-26

## Objectives

- Provide a seamless and secure onboarding experience (Signup).
- Allow existing users to access their dashboard (Login).
- Ensure data integrity and password security.

## Actors and Permissions

| Actor/Role | Permissions |
| --- | --- |
| Guest | Can access Signup and Login pages. |
| User | Can authenticate and transition to the Dashboard. |

## User Flow (Signup)

```mermaid
graph TD
    A[Landing Page CTA] --> B[Signup Page]
    B --> C[Enter Email, Name, Password]
    C --> D{Validation OK?}
    D -->|No| E[Show Validation Errors]
    E --> C
    D -->|Yes| F[Post to /api/auth/register]
    F --> G{Success?}
    G -->|No| H[Show Server Error/User Exists]
    H --> C
    G -->|Yes| I[Redirect to Login]
```

## User Flow (Login)

```mermaid
graph TD
    A[Login Page] --> B[Enter Email & Password]
    B --> C{Validation OK?}
    C -->|No| D[Show Errors]
    D --> B
    C -->|Yes| E[Post to /api/auth/login]
    E --> F{Correct Credentials?}
    F -->|No| G[Unauthorized Error]
    G --> B
    F -->|Yes| H[Store Session/Token]
    H --> I[Redirect to Dashboard]
```

## Acceptance Criteria

1. User can create an account with valid data.
2. User cannot create an account with an existing email.
3. User can log in with correct credentials.
4. "Get Started" and "Login" buttons on the landing page point to the correct routes.
5. Dark mode support for both pages.
