#!/usr/bin/env bash
# verify-skill.sh — sanity check on the PiAPI-Skills tree before release.
#
# Usage: bash scripts/verify-skill.sh
#
# Exits non-zero if any required file is missing or malformed.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail=0

err()    { printf '  x %s\n' "$*" >&2; fail=1; }
ok()     { printf '  + %s\n' "$*"; }
header() { printf '\n== %s ==\n' "$*"; }

# --- top-level required files ---
header "top-level files"
required=(
  README.md
  LICENSE
  NOTICE
  CHANGELOG.md
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  install.sh
  pyproject.toml
  .gitignore
  .editorconfig
)
for f in "${required[@]}"; do
  if [[ -f "$f" ]]; then ok "$f"; else err "missing: $f"; fi
done

# --- CLI ---
header "CLI"
if [[ -f cli/cli.py ]]; then ok "cli/cli.py"; else err "missing cli/cli.py"; fi
if [[ -x cli/piapi-cli ]]; then ok "cli/piapi-cli (executable)"; else err "cli/piapi-cli must be executable"; fi

# --- agent skills ---
header "agents"
expected_agents=(claude codex hermes openclaw cursor windsurf generic)
for a in "${expected_agents[@]}"; do
  path="agents/$a/SKILL.md"
  if [[ ! -f "$path" ]]; then
    err "missing $path"
    continue
  fi
  if ! grep -q "piapi-cli" "$path"; then
    err "$path does not reference piapi-cli"
    continue
  fi
  ok "$path"
done

# --- examples ---
header "examples"
example_count=$(find examples -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')
if [[ "$example_count" -lt 8 ]]; then
  err "expected at least 8 example files, found $example_count"
else
  ok "$example_count example files"
fi

# --- references ---
header "references"
for ref in models.md rest-api.md errors.md webhooks.md rate-limits.md; do
  if [[ -f "references/$ref" ]]; then
    ok "references/$ref"
  else
    err "missing references/$ref"
  fi
done

# --- workflows ---
header "ci"
for wf in .github/workflows/lint.yml .github/workflows/ci.yml; do
  if [[ -f "$wf" ]]; then ok "$wf"; else err "missing $wf"; fi
done

# --- frontmatter sanity for hermes / openclaw ---
header "frontmatter"
for a in hermes openclaw; do
  path="agents/$a/SKILL.md"
  [[ -f "$path" ]] || continue
  first_line=$(head -n1 "$path")
  if [[ "$first_line" != "---" ]]; then
    err "$path missing YAML frontmatter (expected '---' on line 1)"
  else
    ok "$path frontmatter"
  fi
done

# --- summary ---
header "summary"
if [[ "$fail" -ne 0 ]]; then
  printf '\nverify-skill: FAILED\n' >&2
  exit 1
fi
printf '\nverify-skill: OK\n'
