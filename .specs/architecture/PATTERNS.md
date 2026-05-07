# Patterns — `PiAPI-Skills`

> Como escrever código aqui. Curto, opinativo, derivado do que **já está** em `cli/cli.py`, `install.sh`, `agents/*/SKILL.md` e `.github/workflows/`.

---

## 1. Naming

| Item | Convenção | Exemplo no repo |
|------|-----------|-----------------|
| Funções públicas (subcomandos) | `cmd_<acao>` (snake_case) | `cmd_imagine`, `cmd_flux`, `cmd_kling`, `cmd_verify_webhook` |
| Helpers internos | prefixo `_` + snake_case | `_key`, `_headers`, `_post_task`, `_get_task`, `_wait_task`, `_normalize_status`, `_extract_task_id`, `_config_from_args`, `_print_json` |
| Constantes | UPPER_SNAKE | `API_BASE`, `LLM_BASE`, `TERMINAL_STATUSES`, `FAILURE_STATUSES` |
| Env vars | `PIAPI_*` UPPER_SNAKE | `PIAPI_API_KEY`, `PIAPI_API_BASE`, `PIAPI_LLM_BASE`, `PIAPI_VENV_DIR`, `PIAPI_PY_VERSION`, `PIAPI_DEPS`, `PIAPI_WEBHOOK_SECRET` |
| Subcomandos da CLI | kebab-case (argparse já lowercase) | `submit`, `result`, `wait`, `cancel`, `run`, `imagine`, `flux`, `kling`, `suno`, `faceswap`, `llm`, `verify-webhook`, `models` |
| Arquivos Python | snake_case | `cli/cli.py` |
| Arquivos shell | kebab-case | `install.sh`, `cli/piapi-cli` |
| Skill files | sempre `SKILL.md` (uppercase) dentro de `agents/<host>/` | `agents/claude/SKILL.md`, `agents/codex/SKILL.md`, ... |
| Branches | `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>` | — |
| Commits | Conventional Commits | `feat: add cmd_kling`, `fix: handle Staged status` |

Idioma: código e env vars em **inglês**. Comentários e doc em **pt-BR** (preferência do dono do repo).

---

## 2. Estrutura de pastas (real)

```
PiAPI-Skills/
├── cli/
│   ├── cli.py              # CLI single-file: argparse + helpers + subcomandos
│   └── piapi-cli           # shim shell que ativa venv e exec cli.py
├── agents/
│   ├── claude/SKILL.md
│   ├── codex/SKILL.md
│   ├── hermes/SKILL.md
│   ├── openclaw/SKILL.md
│   ├── cursor/SKILL.md
│   ├── windsurf/SKILL.md
│   └── generic/SKILL.md
├── install.sh              # provisiona venv + shim + skills nos hosts
├── pyproject.toml          # ruff + mypy config (não há `[project]` runtime)
├── README.md               # surface map e instruções
├── CHANGELOG.md            # release log
├── .github/workflows/
│   ├── lint.yml            # ruff + shellcheck + markdown link check
│   └── ci.yml              # install-smoke matrix Ubuntu/macOS × Python 3.10/3.11/3.12
└── .specs/                 # specs do produto (este arquivo entre eles)
```

Regra: **a CLI permanece single-file** até atingir tamanho ingovernável (>1500 linhas). Antes disso, splitting é prematuro.

---

## 3. Como adicionar subcomando CLI

Passo a passo, derivado de como `cmd_imagine` e `cmd_flux` foram escritos:

1. Definir função `cmd_<acao>(args, cfg)` em `cli/cli.py`. Não captura argv; usa `args` já parseado.
2. No `main()`, criar `subparsers.add_parser("<acao>")`, declarar flags, chamar `set_defaults(func=cmd_<acao>)`.
3. Reusar **sempre** `_post_task`, `_get_task`, `_wait_task`, `_normalize_status`, `_headers`, `_key`. Não duplicar logic HTTP.
4. Montar envelope `{"model": ..., "task_type": ..., "input": {...}, "config": {...}}`. Service mode (`fast`/`relax`/`turbo`) vai em `config.service_mode`.
5. Se o subcomando suporta `--wait`, encerrar com `_wait_task(task_id, timeout)`.
6. Sempre imprimir resultado final via `_print_json(result)`.
7. Atualizar `cmd_models` se introduziu família nova.
8. Atualizar **todas** as `agents/*/SKILL.md` documentando o novo subcomando (regra de paridade).
9. Adicionar smoke test no `.github/workflows/ci.yml` se o comando for testável sem chave PiAPI (ex.: `--help`).

Critério de feito: `piapi-cli <acao> --help` mostra flags claras + skill files atualizados + ruff/mypy verde.

---

## 4. Como criar/atualizar uma SKILL.md

1. Editar **uma** skill primeiro (ex.: `agents/claude/SKILL.md`).
2. Replicar nas outras seis (`codex`, `hermes`, `openclaw`, `cursor`, `windsurf`, `generic`).
3. Manter divergência mínima entre hosts — só ajustes de voz/registro quando o host exige.
4. Toda flag que aparece em `cli/cli.py` deve aparecer ao menos uma vez na skill correspondente.
5. Nunca documentar HMAC para webhook — PiAPI **não assina**, é shared-secret puro.
6. Nunca documentar `target_index` 1-based em faceswap. **Sempre 0-based**.
7. Status drift: documentar que `Staged` (Midjourney) **não é terminal**.

---

## 5. Como criar/atualizar teste

Não há pytest no repo (estado atual). Os testes são:

### Smoke via CLI

Em `.github/workflows/ci.yml`, validar:
- `piapi-cli --help` retorna 0.
- `piapi-cli models` retorna 0 e mostra catálogo.
- `piapi-cli verify-webhook --secret X --received X` retorna 0.
- `piapi-cli verify-webhook --secret X --received Y` retorna 1.
- `python -m py_compile cli/cli.py` passa.
- `python -c "import importlib.util; spec=importlib.util.spec_from_file_location('cli','cli/cli.py'); ..."` passa (`pyimport` smoke).

### Adicionar pytest (TODO)

Caso o time decida formalizar, sugestão (não decidida ainda):
- Diretório `tests/` na raiz.
- `pytest` + `requests-mock`.
- Cobrir: `_normalize_status` para todos os enums conhecidos, `_extract_task_id` para variantes de envelope, `cmd_verify_webhook` matching/mismatch, parsing de `--config-json`/`--config-file`.

Decisão pendente: humano abrir ADR escolhendo entre manter smoke-only ou adotar pytest.

---

## 6. Tratamento de erro

Padrão observado em `cli.py`:

- `requests.HTTPError` propaga; `cli.py` imprime stderr e exit 1.
- Status terminal `Failed`/`Canceled` → `_print_json(result)` e exit 1 (caller decide).
- Falha de config → `_key()` escreve em stderr e exit 2.
- `verify-webhook` divergente → exit 1 (sem stack trace).

```python
# Padrão usado em _key()
def _key() -> str:
    key = os.environ.get("PIAPI_API_KEY", "").strip()
    if not key:
        sys.stderr.write("PIAPI_API_KEY environment variable is required.\n")
        sys.exit(2)
    return key
```

Nunca `try/except` engolindo. Se ignorar é decisão consciente, comentar em pt-BR explicando por quê.

---

## 7. Logging

CLI não tem logger estruturado. Saída segue:

| Canal | Quando |
|-------|--------|
| `stdout` | resultado JSON da PiAPI (success path) |
| `stderr` | mensagens de erro humano-legíveis, mensagens de progresso opcionais |
| exit 0 | sucesso (status terminal `Completed` ou comando puramente local concluído) |
| exit 1 | falha terminal `Failed`/`Canceled` ou erro HTTP |
| exit 2 | config faltando (`PIAPI_API_KEY` ausente) |

**Nunca logar:** `PIAPI_API_KEY`, valor de webhook secret, body completo de uma chamada LLM com PII de usuário.

---

## 8. Validação

- Arg parsing via **argparse** (stdlib). Sem dependência extra.
- `--config-json` e `--config-file` validados por `_config_from_args`: parse JSON, fail-fast se inválido.
- Schema de envelope é responsabilidade de quem chama (PiAPI valida no servidor). CLI não duplica.
- `verify-webhook` valida apenas presença das duas strings + comparação `compare_digest`.

---

## 9. Imports

Padrão observado em `cli/cli.py`:

```python
import argparse
import hmac
import json
import os
import sys
import time
from typing import Any, Dict, Optional

import requests
```

Regras:
- Stdlib primeiro, em bloco, ordenado alfabeticamente.
- Linha em branco.
- Libs externas (atualmente só `requests`).
- **Sem** `import *`. **Sem** ciclos (CLI single-file evita o problema).
- Sem `from typing import *` — listar explicitamente.

---

## 10. Quando dividir vs manter junto

- `cli.py` é single-file por design. Splitting prematuro = anti-pattern aqui.
- Sinais reais para dividir: arquivo ultrapassar ~1500 linhas; um helper crescer >150 linhas; aparecer um segundo entry point que justifique módulo separado.
- **Não** criar pacote Python publicável sem ADR. Distribuição é via `bash install.sh` e o repo é a unidade de release.
- 3 ocorrências de mesma lógica = candidato a helper. Antes disso, copiar é OK.

---

## 11. Gotchas PiAPI (não esquecer)

Resumo das armadilhas que custam tempo. Repete em DOMAIN.md mas vale ter aqui também porque o agent normalmente lê PATTERNS antes de codar:

- **Status drift:** Midjourney usa `Capitalized`, Flux/Kling usam `lowercase`. Sempre passar por `_normalize_status`.
- **`Staged` não é terminal.** Exclusivo Midjourney. `_wait_task` continua polando.
- **Webhook sem HMAC.** Comparar com `hmac.compare_digest` (constant-time). NUNCA `==`.
- **Faceswap `target_index` 0-based.** Doc PiAPI antiga sugere 1-based — ignorar.
- **Service mode.** `fast` (default), `relax`, `turbo`. Vai em `config.service_mode`, não em `input`.
- **Endpoints distintos.** Async em `POST /api/v1/task`. LLM em `POST /v1/chat/completions` (OpenAI-compat). Header também muda em alguns deploys — `cli.py` usa `X-API-Key`.

---

## 12. CI / Pre-commit

- `ruff check` deve passar (`ruff` é o formatter+linter oficial).
- `ruff format --check` deve passar (sem auto-fix em PR).
- `python -m py_compile cli/cli.py` deve passar.
- `shellcheck install.sh cli/piapi-cli` deve passar.
- Markdown link check (workflow `lint.yml`) deve passar.
- Smoke matrix do `ci.yml` deve passar em Ubuntu/macOS × Python 3.10/3.11/3.12.

Vermelho em qualquer um = não merge.
