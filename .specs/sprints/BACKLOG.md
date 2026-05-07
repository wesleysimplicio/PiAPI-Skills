# Backlog — PiAPI-Skills

Lista priorizada do que falta. Reescrita a partir de inspeção real (`grep TODO|FIXME` em `cli/` e `install.sh` retornou **vazio**, `gh issue list --repo wesleysimplicio/PiAPI-Skills --state open` retornou **vazio** em 2026-05-07).

Itens abaixo são **derivados** dos `.specs/` recém-reescritos (lacunas explicitamente apontadas como `TODO: humano preencher`).

## Convenções

- **P0** — bloqueador, produto não funciona sem isso.
- **P1** — importante, próximas 1-2 sprints.
- **P2** — desejável, fica no radar.
- Status: `todo`, `doing`, `done`.

## Backlog atual

| #   | Título                                                                                          | Prioridade | Sprint alvo | Status |
| --- | ----------------------------------------------------------------------------------------------- | ---------- | ----------- | ------ |
| 1   | Decidir se adota suite pytest dedicada ou mantém smoke-only no CI                              | P1         | sprint-02   | todo   |
| 2   | Abrir ADR formalizando "CLI single-file Python sem SDK gerado"                                 | P1         | sprint-02   | todo   |
| 3   | Abrir ADR formalizando "verify-webhook é shared-secret + `compare_digest`, não HMAC"           | P1         | sprint-02   | todo   |
| 4   | Remover Playwright das instruções genéricas em `AGENTS.md`/`CLAUDE.md`/`copilot-instructions.md` (PiAPI-Skills não tem UI) | P1         | sprint-02   | todo   |
| 5   | Definir baseline de "tempo entre `git clone` e `piapi-cli imagine` rodando" (métrica em VISION) | P1         | sprint-02   | todo   |
| 6   | Definir baseline de "discrepância de status entre run real e doc" (métrica em VISION)          | P1         | sprint-02   | todo   |
| 7   | Adicionar diff automatizado entre `piapi-cli models` e catálogo PiAPI público (alerta de drift) | P2         | sprint-03   | todo   |
| 8   | Smoke E2E gravando `task_id` real em ambiente de staging com chave dedicada                    | P2         | backlog     | todo   |
| 9   | Documentar `agents/<host>/SKILL.md` paridade via teste automático (todas as flags presentes)   | P2         | backlog     | todo   |
| 10  | Avaliar publicação opcional em PyPI (mantendo `bash install.sh` como caminho default)          | P2         | backlog     | todo   |
| 11  | Cobrir `_normalize_status` com fixtures de cada família PiAPI (Midjourney/Flux/Kling/Suno/...) | P2         | sprint-03   | todo   |
| 12  | Adicionar exemplo runnable de servidor de webhook + `cmd_verify_webhook` em `examples/`        | P2         | sprint-03   | todo   |

## Histórico recente (últimos done)

| #  | Título                                                                  | Sprint     | Concluído em |
| -- | ------------------------------------------------------------------------ | ---------- | ------------ |
| 0  | Release 1.0.0 — CLI completa, skills para 7 hosts, CI smoke matrix       | sprint-01  | 2026-05-06   |
| 0a | Reescrita de `.specs/` a partir de inspeção real do código                | bootstrap  | 2026-05-07   |

## Itens descartados ou movidos pra fora

- Nada descartado nesta data. Lista vazia.

## Próximas decisões pendentes

Itens que precisam de decisão de produto ou arquitetura antes de virar task formal:

- **Pytest sim/não** (item #1): impacta tempo de execução do CI e mantém ou não o repo sem dependência de teste runtime.
- **PyPI sim/não** (item #10): se sim, exige montar `[project]` no `pyproject.toml`, configurar release workflow, escolher namespace (`piapi-cli` provavelmente colidirá).
- **Métricas de baseline** (itens #5 e #6): exigem run cronometrado em máquina-referência.
- **Fonte de verdade do catálogo PiAPI** (item #7): scrape oficial vs OpenAPI público vs lista mantida à mão.

## Observações

- Não há TODOs nem FIXMEs no código de produção (`cli/cli.py`, `install.sh`, `cli/piapi-cli`). Confirmado em 2026-05-07.
- Issues abertas no repo GitHub: 0 (`gh issue list --state open` retornou lista vazia em 2026-05-07).
- O que está aqui é dívida **inferida das specs**, não dívida ignorada no código.
