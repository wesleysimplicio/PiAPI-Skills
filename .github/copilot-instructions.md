# Copilot Instructions

> Instruction file lido automaticamente pelo **GitHub Copilot Chat** e **Copilot Workspace / Agent Mode**. Espelha [AGENTS.md](../AGENTS.md) com foco em **Agent Mode workflow**.
>
> Ao trabalhar em Agent Mode, o Copilot pode delegar pra custom agents em `.github/copilot/*.agent.md`. Lista atual: `tdd.agent.md`, `reviewer.agent.md`, `architect.agent.md`.

---

## Stack

`dotnet` (placeholder — substitui pela stack real do projeto, ex: `Node.js 20 + TypeScript + Next.js 14 + Playwright + Vitest`).

- Linguagem principal: `dotnet`
- Framework web/API: `dotnet`
- Banco de dados: `dotnet`
- Test runner unit: `dotnet` (Vitest, Jest, pytest, xUnit)
- Test runner E2E: **Playwright** (config em `playwright.config.ts`)
- Linter/formatter: `dotnet` (ESLint + Prettier, Ruff, dotnet format)
- CI/CD: GitHub Actions (`.github/workflows/`)
- Deploy: `dotnet` (ver `.specs/workflow/RELEASE.md`)

> Antes de adicionar dependência nova: pergunta ao humano. Sem exceção.

---

## Comandos importantes

```bash
# instalação / provisionamento
bash install.sh --yes
bash install.sh --yes --agents claude,codex
bash install.sh --uninstall

# uso da CLI (após install)
export PIAPI_API_KEY="..."
piapi-cli --help
piapi-cli models
piapi-cli imagine "prompt" --wait
piapi-cli flux --model flux-schnell --prompt "..."
piapi-cli kling --task-type txt2video --prompt "..."
piapi-cli suno --prompt "..."
piapi-cli faceswap --target ... --source ...
piapi-cli llm --model claude-3-5-sonnet --prompt "..."
piapi-cli submit --model X --task-type Y --input '{}'
piapi-cli result <task_id>
piapi-cli wait <task_id> --timeout 600
piapi-cli verify-webhook --secret X --received Y

# qualidade local
ruff check cli/
ruff format --check cli/
python -m py_compile cli/cli.py
shellcheck install.sh cli/piapi-cli
mypy cli/cli.py

# git/PR
git checkout -b feat/<slug>
gh pr create --fill
gh run watch
```

Stack: Python 3.10+ single-file (`cli/cli.py`) + bash provisioner (`install.sh`). Sem `npm`/`pnpm`/`dotnet`/Playwright/Vitest. CI valida em Ubuntu/macOS × Python 3.10/3.11/3.12 (`.github/workflows/ci.yml`).

---

## Workflow loop OBRIGATÓRIO (Agent Mode)

Em Copilot Workspace/Agent Mode, todo plano de execução segue esse loop. Não pula etapa.

1. **Ler task** — abre `.specs/sprints/sprint-XX/<task-id>.task.md`. Lê contexto + acceptance criteria + test plan + DoD.
2. **Plano explícito** — Copilot Workspace gera spec/plan. Revisa antes de implementar.
3. **Carregar contexto** — `.specs/architecture/PATTERNS.md` + ADRs relevantes em `.specs/architecture/ADR-*.md`. Skills aplicáveis em `.skills/`.
4. **Implementar (Agent Mode)** — edits cirúrgicos. Só toca o que a task pede. Sem refactor extra.
5. **Lint** — `npm run lint`. Vermelho = corrige.
6. **Unit** — `npm test`. Vermelho = corrige. Coverage do diff >= 80%.
7. **E2E** — `npx playwright test`. Captura screenshot/trace/video.
8. **Fix loop** — falhou? Volta ao 4. Repete até verde.
9. **Commit** — Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Mensagem em **inglês**.
10. **PR** — `gh pr create --fill`. Preenche template inteiro.

---

## Definition of Done

PR só faz merge quando todos os itens abaixo estão marcados:

- [ ] Unit tests passam
- [ ] Lint passa
- [ ] E2E Playwright passa **com evidência anexada** (screenshot, trace, video)
- [ ] Coverage do diff >= 80%
- [ ] Acceptance Criteria todos marcados
- [ ] PR template preenchido (link task + descrição + evidências)
- [ ] Conventional commit no merge
- [ ] ADR criado se mudou decisão arquitetural
- [ ] Changelog atualizado se release-relevant
- [ ] Sem warning novo, sem `console.log`/`print` deixado pra trás
- [ ] Sem TODO sem dono e sem prazo

CI bloqueia merge se DoD falhar (`.github/workflows/dod.yml`).

---

## Padrões de código

`.specs/architecture/PATTERNS.md` é a **fonte única**. Naming, estrutura, criação de endpoint/componente/teste, tratamento de erro, logging, validação — tudo lá.

Decisões irreversíveis viram **ADR** em `.specs/architecture/ADR-XXX-*.md` (template em `.specs/architecture/ADR-template.md`).

---

## Onde encontrar contexto

| Pergunta | Onde olha |
|---|---|
| Por que esse produto existe? | `.specs/product/VISION.md` |
| Quem é o usuário? | `.specs/product/PERSONAS.md` |
| Quais entidades de negócio? | `.specs/product/DOMAIN.md` |
| Como o sistema é desenhado? | `.specs/architecture/DESIGN.md` |
| Como escrever código aqui? | `.specs/architecture/PATTERNS.md` |
| Por que decidimos X? | `.specs/architecture/ADR-*.md` |
| Como faço PR/branch/release? | `.specs/workflow/WORKFLOW.md`, `RELEASE.md`, `CONTRIBUTING.md` |
| Backlog? | `.specs/sprints/BACKLOG.md` |
| Sprint atual? | `.specs/sprints/sprint-XX/SPRINT.md` |
| Skills? | `.skills/README.md` + `.skills/*/SKILL.md` |

---

## Proibido

- **Pular testes** — sem unit/E2E = sem merge.
- **Mockar pra fazer passar** — mock só pra dep externa real (HTTP, DB), nunca pra esconder falha.
- **Commit com vermelho** — lint/test falhando = não commita.
- **Ignorar ADR** — decisão registrada é lei.
- **Adicionar dependência sem perguntar.**
- **Editar arquivo não lido.**
- **Refactor escondido em PR de feature** — PR separado.
- **Force push em `main`/`master`.**
- **Commitar segredo** (`.env`, token, key, senha).
- **Reformatar arquivo inteiro num PR pequeno.**

---

## Custom agents (Copilot Workspace / Agent Mode)

Copilot pode delegar pra um custom agent quando a tarefa casa com a `description` do agent. Definidos em `.github/copilot/`:

- **`tdd.agent.md`** — TDD Specialist. Escreve teste falhando antes do código. Loop red-green-refactor. Tools: `edit`, `terminal`, `search`. Aciona quando tarefa exige cobertura nova ou regression test.
- **`reviewer.agent.md`** — Code Reviewer. Read-only. Comenta problemas e sugestões em PR. Tools: `search`, `read`. Aciona em revisão de PR aberto, sem editar arquivos.
- **`architect.agent.md`** — Architect. Desenha arquitetura, cria ADRs, atualiza `PATTERNS.md`. **Não escreve código de produção.** Tools: `edit`, `search`, `read`. Aciona em decisão arquitetural, refactor amplo, integração nova.

Pra invocar explicitamente em Copilot Chat: `@tdd`, `@reviewer`, `@architect`.

---

## Skills disponíveis (`.skills/`)

- **`playwright-e2e`** — como escrever teste Playwright. Trigger: nova feature de UI / fluxo end-to-end.
- **`conventional-commits`** — regras de commit (`feat:`, `fix:`, etc.). Trigger: hora de commitar.
- **`_template`** — base pra criar skill nova.

Detalhes em `.skills/README.md`.

---

## Comandos especiais

### Criar nova ADR

```bash
cp .specs/architecture/ADR-template.md .specs/architecture/ADR-XXX-<slug>.md
# preenche e commita junto com a feature
```

### Abrir PR

```bash
git push -u origin $(git branch --show-current)
gh pr create --fill
```

### Criar task

```bash
cp .specs/sprints/task-template.md .specs/sprints/sprint-XX/<id>-<slug>.task.md
```

### DoD local antes de push

```bash
npm run lint && npm test -- --coverage && npx playwright test
```

---

## Notas finais

- **Idioma**: docs em pt-BR, código em inglês, commits em inglês.
- **Sem emoji em código fonte.** README/slides ok.
- **Sem resumo no final** de resposta.
- **Sem estimativa de tempo.**
- **Pergunta apenas em ambiguidade real.**
- **Paralelismo** — research + read + review independentes rodam simultâneos em Agent Mode.
