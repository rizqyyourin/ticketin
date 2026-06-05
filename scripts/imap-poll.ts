/**
 * IMAP polling daemon — runs outside Next.js.
 * Polls Gmail IMAP every 30s for new emails and routes replies
 * to the matching ticket via POST /api/inbound/email.
 *
 * Uses UID-based tracking (not \Seen flag) to avoid issues with
 * Gmail auto-marking messages as read when opened in webmail.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/imap-poll.ts
 *
 * Required env (in .env):
 *   SMTP_USER, SMTP_PASS, NEXTAUTH_URL, INBOUND_EMAIL_SECRET
 *
 * Optional:
 *   IMAP_HOST (default: imap.gmail.com)
 *   IMAP_PORT (default: 993)
 *   POLL_INTERVAL_MS (default: 30000)
 */

import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const IMAP_HOST = process.env.IMAP_HOST ?? "imap.gmail.com";
const IMAP_PORT = Number(process.env.IMAP_PORT ?? 993);
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS ?? 10_000);
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const INBOUND_SECRET = process.env.INBOUND_EMAIL_SECRET ?? "";

// ── UID-based tracking — no reliance on \Seen flag ───────────────────────────
// On first run, all existing UIDs are pre-loaded as "already processed"
// so we only pick up messages that arrive after the daemon starts.
const processedUids = new Set<number>();
let initialized = false;

async function pollOnce() {
  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
    },
    logger: false,
  });

  await client.connect();

  const lock = await client.getMailboxLock("INBOX");
  try {
    // On first run: record all existing UIDs as already-seen
    if (!initialized) {
      const allResult = await client.search({ all: true }, { uid: true });
      const allUids = Array.isArray(allResult) ? allResult : [];
      for (const uid of allUids) processedUids.add(uid);
      initialized = true;
      console.log(`[IMAP] Initialized — ${processedUids.size} existing message(s) skipped`);
      return;
    }

    // Search last 7 days; filter to only UIDs not yet processed
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const searchResult = await client.search({ since }, { uid: true });
    const allUids = Array.isArray(searchResult) ? searchResult : [];
    const newUids = allUids.filter((uid) => !processedUids.has(uid));

    console.log(`[IMAP] ${newUids.length} new message(s) (${allUids.length} in 7d window)`);
    if (newUids.length === 0) return;

    for await (const msg of client.fetch(newUids, { source: true, uid: true }, { uid: true })) {
      // Mark processed immediately — prevents retrying even if routing fails
      processedUids.add(msg.uid);

      try {
        if (!msg.source) continue;
        const parsed = await simpleParser(msg.source);

        const from =
          (parsed.from?.value?.[0]?.address ?? parsed.from?.text) || "unknown@unknown";
        const text = parsed.text ?? parsed.html ?? "";
        const inReplyTo = parsed.headers.get("in-reply-to") as string | undefined;
        const references = parsed.headers.get("references") as string | undefined;
        const subject = Array.isArray(parsed.subject)
          ? parsed.subject[0]
          : parsed.subject ?? "";

        console.log(`[IMAP] uid=${msg.uid} from=${from} subject="${subject}"`);
        console.log(`[IMAP]   In-Reply-To: ${inReplyTo ?? "(none)"}`);
        console.log(`[IMAP]   References: ${references ?? "(none)"}`);

        if (!inReplyTo && !references) {
          console.log(`[IMAP]   → skipped (no thread references)`);
          continue;
        }

        const res = await fetch(`${BASE_URL}/api/inbound/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: INBOUND_SECRET,
            from,
            subject,
            text,
            inReplyTo,
            references,
          }),
        });

        if (!res.ok) {
          const body = await res.text().catch(() => "(no body)");
          console.error(`[IMAP]   → webhook error ${res.status}: ${body}`);
        } else {
          const json = (await res.json()) as { status?: string; ticketId?: string };
          if (json.status === "ok") {
            console.log(`[IMAP]   → routed to ticket ${json.ticketId}`);
          } else {
            console.log(`[IMAP]   → unmatched`);
          }
        }
      } catch (msgErr) {
        console.error(`[IMAP] Error processing uid=${msg.uid}:`, msgErr);
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }
}

async function main() {
  console.log(`[IMAP] Polling ${IMAP_HOST}:${IMAP_PORT} every ${POLL_INTERVAL / 1000}s`);
  const run = () => pollOnce().catch((err) => console.error("[IMAP] Poll error:", err));
  await run();
  setInterval(run, POLL_INTERVAL);
}

main();
