#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/android"

./gradlew --stop 2>/dev/null || true
rm -rf app/.cxx

./gradlew clean
