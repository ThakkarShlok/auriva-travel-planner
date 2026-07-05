#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL_UNPOOLED:-}" ]]; then
  echo "ERROR: DATABASE_URL_UNPOOLED is required." >&2
  echo 'Usage: DATABASE_URL_UNPOOLED="postgresql://..." bash scripts/run-all-migrations.sh' >&2
  exit 1
fi

scripts=(
  "scripts/run-migration.mjs"
  "scripts/run-migration-phase8.mjs"
  "scripts/run-migration-phase9.mjs"
  "scripts/run-migration-phase11a.mjs"
)

for script in "${scripts[@]}"; do
  echo
  echo "==> Running ${script}"
  DATABASE_URL_UNPOOLED="${DATABASE_URL_UNPOOLED}" DATABASE_URL="${DATABASE_URL_UNPOOLED}" node "${script}"
  echo "==> Success: ${script}"
done

echo
echo "All migrations completed successfully."
