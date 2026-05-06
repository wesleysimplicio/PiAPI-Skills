# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-05-06

### Added
- Public release of PiAPI Skills bundle.
- `cli/cli.py` PiAPI CLI: `submit`, `wait`, `result`, `cancel`, `run`,
  `imagine`, `flux`, `kling`, `suno`, `faceswap`, `llm`, `verify-webhook`,
  `models`. Pure `requests`, status-enum-aware polling, webhook config
  pass-through.
- `cli/piapi-cli` shell shim that resolves to the bundled venv.
- `install.sh` provisioner: virtualenv, CLI symlink, agent skill copy.
  Flags: `--yes`, `--uninstall`, `--agents <list>`.
- Agent skill files (`agents/<agent>/SKILL.md`) for **Claude Code**,
  **Codex**, **Hermes**, **OpenClaw**, **Cursor**, **Windsurf**, plus a
  generic portable variant. Each tuned to its host's frontmatter and
  tool-allow conventions.
- Cookbook examples (`examples/01..08`) covering Flux txt2img, Midjourney
  imagine + upscale, Kling image2video, Suno music, Faceswap image / multi
  / video, Hunyuan video, OpenAI-compatible LLM, and webhooks.
- References (`references/`): `rest-api.md`, `models.md`, `errors.md`,
  `webhooks.md`, `rate-limits.md`.
- MIT license + NOTICE attribution to upstream `requests` (Apache 2.0).
- GitHub Actions: `lint.yml` (ruff + shellcheck + py_compile) and
  `ci.yml` (install smoke + verify-webhook smoke).

### Security
- `verify-webhook` uses `hmac.compare_digest` for constant-time secret
  comparison. PiAPI does not HMAC-sign webhooks, so secret-equality is
  the only authentication signal.

[1.0.0]: https://github.com/wesleysimplicio/PiAPI-Skills/releases/tag/v1.0.0
