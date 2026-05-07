# VISION — PiAPI-Skills

Documento de uma página. Mantém o time alinhado sobre o porquê.

---

## Problema

Times que usam **PiAPI** (gateway unificado para Midjourney, Flux, Kling, Luma, Hailuo, Veo 3, Suno, F5-TTS, LLM gateway etc.) precisam lidar com sutilezas que mudam de família para família: enums de status com capitalização diferente, status `Staged` da Midjourney que parece terminal mas não é, webhooks da PiAPI que **não usam HMAC** (apenas shared secret), payloads `target_index` 0-based em faceswap. Cada novo agente AI (Claude Code, Codex, Hermes, OpenClaw, Cursor, Windsurf) que precisa chamar esse gateway acaba reinventando wrappers, errando o status drift e trazendo dependências pesadas.

PiAPI-Skills resolve isso com **uma CLI Python single-file (`cli/cli.py`)** que cobre o catálogo todo da PiAPI e um **bundle de SKILL.md** instalado em paralelo nas pastas de cada agente — fonte única, comportamento idêntico, zero dependência além do `requests`.

---

## Quem usa

- **Persona primária:** dev/agente AI consumindo a CLI `piapi-cli` no terminal ou via skill carregada por um host AI.
- **Persona secundária:** operador de frota (CI/cron) que precisa submeter tasks em lote, esperar terminal e tratar webhooks.
- **Quem NÃO é o público:** consumidores finais de imagem/vídeo gerado — esse público interage com produtos construídos *em cima* dessa CLI, não diretamente.

Detalhes em `./PERSONAS.md`.

---

## Diferencial

- **CLI única para o catálogo todo** — Midjourney, Flux, Gemini, Kling, Luma, Hailuo, Veo 3, Seedance 2, Hunyuan, Suno, MMAudio, F5-TTS, Trellis, Faceswap, LLM gateway. Subcomandos curtos (`imagine`, `flux`, `kling`, `suno`, `faceswap`, `llm`) + comandos genéricos (`submit`, `result`, `wait`, `cancel`, `run`).
- **Status enum drift tratado de fato** — `_normalize_status()` em `cli.py` lida com `Capitalized` (Midjourney) vs `lowercase` (Flux/Kling) e marca `Staged` como **não-terminal**.
- **Webhook PiAPI-compatível, sem inventar HMAC** — `verify-webhook` compara o header `x-webhook-secret` com `hmac.compare_digest` (constant-time). Documenta retry policy real (5s × 3).
- **Multi-agent skill bundle** — `install.sh` provisiona o mesmo SKILL.md em `~/.claude/skills/piapi/`, `~/.codex/skills/piapi/`, `~/.hermes/skills/piapi/`, `~/.openclaw/skills/piapi/`, `.cursor/skills/piapi/`, `.windsurf/skills/piapi/` e `~/.local/share/agent-skills/piapi/`.
- **Zero dependência runtime extra** — só `requests`. Provisionamento via venv isolado em `~/.local/share/piapi-skill/venv` + shim em `~/.local/bin/piapi-cli`. Usa `uv` se disponível, fallback `python3 -m venv`.
- **Smoke matrix CI real** — Ubuntu/macOS × Python 3.10/3.11/3.12 (`.github/workflows/ci.yml`).

---

## Métricas de sucesso

| Métrica | Baseline | Meta | Como medimos |
|---|---|---|---|
| Tempo entre `git clone` e `piapi-cli imagine` rodando | TODO: humano preencher | < 2 min | Smoke do CI mede `bash install.sh --yes` + `piapi-cli --help` |
| Cobertura de famílias PiAPI no `piapi-cli models` | 14 famílias (v1.0.0) | catálogo PiAPI atual | Diff `piapi-cli models` vs docs PiAPI |
| Falhas de install no CI matrix | 0 | 0 | `install-smoke` job passa em todas combinações |
| Issues abertas no GitHub | 0 (2026-05-07) | < 5 abertas P0/P1 | `gh issue list --state open` |
| Discrepância de status entre run real e doc | TODO: humano preencher | 0 | Comparar `_normalize_status` com responses reais |

---

## Não-objetivos

- **Não somos um SDK Python da PiAPI.** Não geramos client tipado de `openapi.json`. CLI fina + skill text é o produto.
- **Não orquestramos múltiplas tasks com retry/backoff sofisticado.** `_wait_task` é polling simples com timeout. Quem precisa de fila usa Celery/Sidekiq por fora.
- **Não cacheamos resultados.** PiAPI já guarda outputs; cache é responsabilidade do consumidor.
- **Não suportamos auth além de `PIAPI_API_KEY` em header `X-API-Key`.** OAuth, JWT etc. ficam fora.
- **Não entregamos UI nem dashboard.** É CLI + skill markdown. Quem quer UI consome a CLI por baixo.

---

## Tese de longo prazo

Em 12 meses, qualquer agente AI executando localmente (Claude Code, Codex, Hermes, OpenClaw, Cursor, Windsurf, ou novos) consegue gerar mídia/áudio/vídeo via PiAPI lendo apenas a SKILL.md correspondente — sem aprender as quirks da PiAPI, sem instalar nada além do shim, sem inventar wrapper próprio.

---

## Histórico

| Data | Versão | Mudança | Quem |
|---|---|---|---|
| 2026-05-06 | 1.0.0 | Release inicial — CLI completa, skills para 7 hosts, CI smoke matrix | Wesley Simplicio |
| 2026-05-07 | — | Reescrita do `.specs/` a partir de inspeção real do código | Wesley Simplicio |
