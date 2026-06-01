---
description: "Bootstrap Ticketin CRM (Next.js) with a modern red-white landing page first, then phase-ready core modules"
name: "Bootstrap Ticketin CRM"
argument-hint: "Brand/business context, priority modules, and visual direction"
agent: "agent"
model: "GPT-5 (copilot)"
---
You are bootstrapping a production-minded fullstack Next.js CRM called **Ticketin**.

Inputs (from user message):
- Business context and core workflow
- Priority features and delivery order
- Design direction and visual constraints

Goals:
1. Initialize project structure for Next.js fullstack app.
2. Install and wire essential frontend libraries: Tailwind CSS, shadcn/ui, Lucide icons, and animation support.
3. Build an attractive, minimal, modern landing page first.
4. Keep architecture ready for next phases: auth, contact, queue, service requests, dashboard, then roles/permissions.

Implementation constraints:
- Theme direction: clean red-white visual identity.
- Keep UI intentional and polished (not generic template look).
- Ensure responsive behavior on mobile and desktop.
- Use maintainable folder structure and clear naming.

Execution order:
1. Scaffold app and baseline tooling.
2. Add UI dependencies and base design tokens.
3. Implement landing page sections (hero, value props, CTA, preview cards).
4. Verify app builds and runs.
5. Summarize next implementation phases with concrete module boundaries.

Output format:
- "What I changed" with file-level summary
- "How to run" with exact commands
- "Next steps" as numbered list aligned to the planned feature order
