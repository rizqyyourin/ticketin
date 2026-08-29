#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/ticketin}"
BRANCH="${BRANCH:-main}"
PM2_APP_NAME="${PM2_APP_NAME:-ticketin}"
LOG_FILE="${LOG_FILE:-/tmp/ticketin-deploy.log}"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "[$(date -Iseconds)] Starting deploy for '$PM2_APP_NAME' in '$APP_DIR'"

cd "$APP_DIR"

current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "$BRANCH" ]]; then
  echo "Refusing deploy: current branch is '$current_branch', expected '$BRANCH'."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Refusing deploy: working tree is dirty."
  git status --short
  exit 1
fi

echo "[$(date -Iseconds)] Fetching latest branch '$BRANCH'"
git fetch origin "$BRANCH"
echo "[$(date -Iseconds)] Pulling latest branch '$BRANCH'"
git pull --ff-only origin "$BRANCH"

echo "[$(date -Iseconds)] Running pnpm/npm install"
if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile
elif [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "[$(date -Iseconds)] Generating Prisma client"
if command -v pnpm >/dev/null 2>&1 && [[ -f pnpm-lock.yaml ]]; then
  pnpm exec prisma generate
else
  npx prisma generate
fi

echo "[$(date -Iseconds)] Syncing database schema"
if command -v pnpm >/dev/null 2>&1 && [[ -f pnpm-lock.yaml ]]; then
  pnpm exec prisma db push --accept-data-loss
else
  npx prisma db push --accept-data-loss
fi

echo "[$(date -Iseconds)] Running build"
NODE_ENV=production pnpm run build 2>/dev/null || NODE_ENV=production npm run build

echo "[$(date -Iseconds)] Reloading PM2 app '$PM2_APP_NAME'"
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --only "$PM2_APP_NAME" --update-env
else
  pm2 start ecosystem.config.cjs --only "$PM2_APP_NAME" --update-env
fi

pm2 save

echo "[$(date -Iseconds)] Running local health check"
if ! curl --fail --silent --show-error --retry 15 --retry-delay 2 --retry-connrefused http://127.0.0.1:3001/ >/dev/null; then
  echo "[$(date -Iseconds)] Health check failed, capturing PM2 diagnostics"
  pm2 describe "$PM2_APP_NAME" --no-color || true
  echo "---- PM2 error log (last 50 lines) ----"
  tail -n 50 /var/log/pm2/ticketin-error.log 2>/dev/null || true
  echo "---- PM2 out log (last 50 lines) ----"
  tail -n 50 /var/log/pm2/ticketin-out.log 2>/dev/null || true
  exit 1
fi
echo "[$(date -Iseconds)] Deploy complete for '$PM2_APP_NAME'."
