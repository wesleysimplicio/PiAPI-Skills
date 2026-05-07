# PERSONAS — PiAPI-Skills

PiAPI-Skills não tem login/perfil de usuário (é uma CLI + skill bundle). As personas abaixo refletem **quem instala e roda `piapi-cli`** ou **quem carrega o SKILL.md em um host AI**, inferidas do design de `install.sh` (`ALL_AGENTS=(claude codex hermes openclaw cursor windsurf generic)`), do shim `piapi-cli` e dos subcomandos da CLI.

---

## Persona 1 — Dev "terminal-AI"

**Arquétipo:** dev solo ou em time pequeno que usa um agente AI no terminal/IDE como ferramenta diária e quer disparar geração de imagem/vídeo/áudio sem sair do shell.

### Quem é

- **Papel:** full-stack, indie hacker, automation engineer.
- **Familiaridade com tech:** alta — usa `git`, `gh`, `curl`, `jq`, `uv`/`pip` todo dia.
- **Familiaridade com PiAPI:** baixa a média. Sabe que existe, não quer ler 14 quickstarts.
- **Host AI principal:** Claude Code, Codex CLI ou Cursor.

### Objetivos

- Submeter uma task à PiAPI em **um comando** (`piapi-cli imagine "..."`, `piapi-cli flux ...`, `piapi-cli kling ...`).
- Esperar o resultado terminal sem escrever loop de polling.
- Verificar webhook recebido sem implementar HMAC inexistente.
- Não instalar dependência pesada nem poluir o `PATH` global.

### Frustrações / dores

- Status enum muda de capitalização entre famílias (descobre na pior hora).
- `Staged` da Midjourney parece terminal, não é.
- Webhook PiAPI não assina; muita doc na internet ensina a verificar HMAC errado.
- Faceswap `target_index` 0-based vs 1-based confunde.
- SDK Python da PiAPI não cobre tudo, força ir direto no `requests`.

### Contexto de uso

- **Ambiente:** terminal + editor + agente AI.
- **Frequência:** ad-hoc, diária quando está num projeto que precisa.
- **Sessão típica:** 1-3 chamadas por sessão, com `piapi-cli wait`.
- **Trigger principal:** "preciso gerar essa imagem/áudio/vídeo agora".

### Métrica que importa

- Tempo entre `bash install.sh` e primeiro `imagine` rodando: < 2 min.
- Não precisar abrir o `cli/cli.py` para descobrir flag — `piapi-cli <cmd> --help` cobre.

---

## Persona 2 — Operador de frota / CI

**Arquétipo:** quem roda PiAPI em background — cron job, GitHub Actions, worker container, batch nightly. Não está olhando o terminal.

### Quem é

- **Papel:** DevOps, ML platform engineer, SRE.
- **Familiaridade com tech:** alta. Vive em `bash` + `Dockerfile` + workflow YAML.
- **Familiaridade com PiAPI:** funcional. Lê doc quando precisa, espera que a CLI tenha o defaults certos.
- **Host AI principal:** geralmente nenhum no runtime — humano configura uma vez e CI roda. Quando há agente, é Hermes ou OpenClaw em loop.

### Objetivos

- Submeter N tasks em batch e aguardar terminal sem travar.
- Receber webhook PiAPI em endpoint próprio e verificar shared secret de forma segura (constant-time).
- Reproduzir comportamento idêntico em macOS dev e Ubuntu CI.
- Falhar barulhento quando `PIAPI_API_KEY` está ausente (exit code 2 explícito).

### Frustrações / dores

- Scripts caseiros divergem entre máquinas.
- `set -e` com `curl` da PiAPI força tratar status HTTP manualmente.
- Bibliotecas de webhook genéricas exigem HMAC que a PiAPI não implementa.
- Smoke test de install em matrix de OS/Python é trabalho manual.

### Contexto de uso

- **Ambiente:** container Docker, GitHub Actions runner, host headless.
- **Frequência:** contínua (cron) ou em todo merge (CI).
- **Sessão típica:** sem sessão — processo longo rodando.
- **Trigger principal:** evento (commit, schedule, mensagem em fila) → roda pipeline.

### Métrica que importa

- Smoke matrix do `.github/workflows/ci.yml` verde em Ubuntu/macOS × Python 3.10/3.11/3.12.
- 0 falhas no `verify-webhook --secret X --received X` (matching) e exit 1 quando difere.
- 0 chamadas fantasma — CLI nunca faz request sem `PIAPI_API_KEY`.

---

## Persona 3 — Agente AI consumindo SKILL.md

**Arquétipo:** Claude Code, Codex CLI, Hermes, OpenClaw, Cursor, Windsurf — qualquer agente que carrega a skill `piapi/SKILL.md` da pasta resolvida pelo `install.sh`.

### Quem é

- Não é humano. Sistema AI com janela de contexto, sem memória entre sessões.
- **Capacidades:** lê markdown, executa shell, parseia JSON.
- **Limitações:** depende 100% do que a SKILL.md descreve. Sem acesso a doc PiAPI fora do que a skill cita.
- **Path típico onde carrega a skill:** `~/.claude/skills/piapi/SKILL.md`, `~/.codex/skills/piapi/SKILL.md`, `~/.hermes/skills/piapi/SKILL.md`, `~/.openclaw/skills/piapi/SKILL.md`, `<cwd>/.cursor/skills/piapi/SKILL.md`, `<cwd>/.windsurf/skills/piapi/SKILL.md`, `~/.local/share/agent-skills/piapi/SKILL.md`.

### Objetivos

- Encontrar exatamente o subcomando certo para a task pedida (texto, imagem, vídeo, áudio, faceswap, LLM).
- Saber as quirks (status drift, Staged, webhook sem HMAC, faceswap 0-based) sem inferir.
- Validar saída via `_normalize_status` e `TERMINAL_STATUSES` antes de declarar feito.
- Não inventar flags que não existem.

### Frustrações / dores

- SKILL.md genérica obriga adivinhar.
- Doc PiAPI oficial muda capitalização sem aviso → status drift.
- Falta de exemplo concreto de webhook PiAPI faz o agente alucinar HMAC.

### Contexto de uso

- **Ambiente:** dentro do host AI, lendo a skill quando o humano pede algo PiAPI-related.
- **Frequência:** sob demanda.
- **Sessão típica:** carrega skill → executa um a três comandos `piapi-cli` → reporta resultado.
- **Trigger principal:** humano menciona "PiAPI", "Midjourney", "Flux", "Kling", "geração de imagem/vídeo/áudio".

### Métrica que importa

- % de tasks que terminam em `Completed`/`completed` sem o agente confundir `Staged` com terminal.
- 0 invocações com payload malformado (envelope errado).
- 0 verificações de webhook com `==` em vez de `compare_digest`.

---

## Histórico

| Data | Mudança | Quem |
|---|---|---|
| 2026-05-07 | Personas inferidas de `install.sh` (`ALL_AGENTS`), `cli/cli.py` (subcomandos), workflows CI | Wesley Simplicio |
