#!/bin/sh
set -e

if [ -n "${DATABASE_URL:-}" ]; then
  npx prisma db push
fi

if [ "${ENABLE_IMAP_POLL:-true}" = "true" ] && [ -n "${SMTP_USER:-}" ] && [ -n "${INBOUND_EMAIL_SECRET:-}" ]; then
  echo "Starting IMAP poll worker..."
  npm run email:poll:prod &
else
  echo "IMAP poll worker disabled (set ENABLE_IMAP_POLL=false to suppress)"
fi

exec npx next start -p "${PORT:-3001}"
