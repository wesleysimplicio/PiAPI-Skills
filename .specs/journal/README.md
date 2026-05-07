# Journal — diário de bordo do time

Memória de longo prazo entre sessões. Agent perde contexto, journal sobrevive.

## Convenção

Um arquivo por dia útil de trabalho:

```
.specs/journal/2026-05-07.md
.specs/journal/2026-05-08.md
```

Nome do arquivo: `YYYY-MM-DD.md` (ISO 8601, sem hora).

## Quando escrever

- **Fim do dia (5–10 min, humano)** — registra o que rolou, decisões e blockers.
- **Início do dia seguinte (agent lê automaticamente)** — INIT/hooks de session-start podem carregar a entrada mais recente como contexto.

## Template

Copie `_template.md` para iniciar uma entrada nova:

```bash
cp .specs/journal/_template.md .specs/journal/$(date +%F).md
```

## Regras

- pt-BR no conteúdo, código/identificadores em inglês.
- Sem segredo, token, senha, dado pessoal.
- Linkar PRs/issues/ADRs por número (PR #42, ADR-005).
- Decisão arquitetural deve virar ADR-NNN-*.md, não ficar só no journal.
