# AGENTS.md

> Master instruction file lido por **Claude Code**, **Codex CLI**, **GitHub Copilot**, **Hermes Agent** (Nous Research), **OpenClaw**, **Cursor**, **Aider** e qualquer outro agent que respeite o padrão `AGENTS.md`. É o contrato entre humano e IA neste repositório.
>
> Mudou algo aqui? Reflete em `CLAUDE.md` e `.github/copilot-instructions.md` (mantém os três alinhados ou usa symlink).

Este arquivo dá ao agent **tudo que ele precisa saber pra entregar uma task** sem perguntar: stack, comandos, fluxo de trabalho, padrões, proibições, skills disponíveis e atalhos. Lê ele inteiro antes de escrever a primeira linha de código.

---

## Stack

`dotnet` (placeholder — substitui pela stack real do projeto, ex: `Node.js 20 + TypeScript + Next.js 14 + Playwright + Vitest`).

Detalhes completos:

- Linguagem principal: `dotnet`
- Framework web/API: `dotnet`
- Banco de dados: `dotnet`
- Test runner unit: `dotnet` (sugestão: Vitest, Jest, pytest, xUnit)
- Test runner E2E: **Playwright** (config em `playwright.config.ts`)
- Linter/formatter: `dotnet` (sugestão: ESLint + Prettier, Ruff, dotnet format)
- CI/CD: GitHub Actions (ver `.github/workflows/`)
- Deploy: `dotnet` (Vercel/Netlify/Docker/Azure/AWS — ver `.specs/workflow/RELEASE.md`)

> Antes de adicionar dependência nova: **pergunta ao usuário**. Sem exceção.

---

## Comandos importantes

```bash
# instalação / provisionamento
bash install.sh --yes                                  # instala venv + shim + skills em todos os hosts
bash install.sh --yes --agents claude,codex            # apenas hosts escolhidos
bash install.sh --uninstall                            # remove venv, shim e skills

# uso da CLI (após install)
export PIAPI_API_KEY="..."                             # obrigatório
piapi-cli --help                                       # lista subcomandos
piapi-cli models                                       # mostra catálogo
piapi-cli imagine "prompt" --wait                      # Midjourney imagine + aguarda terminal
piapi-cli flux --model flux-schnell --prompt "..."     # Flux txt2img
piapi-cli kling --task-type txt2video --prompt "..."   # Kling vídeo
piapi-cli suno --prompt "..."                          # Suno música
piapi-cli faceswap --target ... --source ...           # Faceswap (target_index 0-based)
piapi-cli llm --model claude-3-5-sonnet --prompt "..." # LLM gateway OpenAI-compat
piapi-cli submit --model X --task-type Y --input '{}'  # envelope genérico
piapi-cli result <task_id>                             # buscar resultado
piapi-cli wait <task_id> --timeout 600                 # esperar terminal
piapi-cli verify-webhook --secret X --received Y       # constant-time compare

# qualidade local (sem deps extras além do venv do install)
ruff check cli/                                        # lint
ruff format --check cli/                               # format check
python -m py_compile cli/cli.py                        # smoke compile
shellcheck install.sh cli/piapi-cli                    # shell lint
mypy cli/cli.py                                        # type-check (escopo: cli.py)

# git/PR
git checkout -b feat/<slug>
gh pr create --fill                                    # template de PR
gh run watch                                           # acompanha CI do branch
```

Não há `npm`, `pnpm`, `dotnet`, Playwright, Jest, Vitest neste repo — é Python 3.10+ single-file. CI valida em Ubuntu/macOS × Python 3.10/3.11/3.12 (`.github/workflows/ci.yml`).

---

## Workflow loop OBRIGATÓRIO

Toda task técnica passa por esses passos. Não pula etapa.

1. **Ler task** — abre arquivo em `.specs/sprints/sprint-XX/<task-id>.task.md`. Lê contexto + acceptance criteria + test plan + DoD.
2. **Planejar** — escreve plano interno curto: o que muda, quais arquivos, como verificar, efeitos colaterais. Se task ambígua → pergunta antes de codar.
3. **Carregar contexto** — lê `.specs/architecture/PATTERNS.md` + ADRs relevantes em `.specs/architecture/ADR-*.md`. Verifica skills aplicáveis em `.skills/`.
4. **Editar** — aplica edits cirúrgicos. Só toca o que a task pede. Sem refactor extra, sem renomeação, sem comentário a mais.
5. **Lint** — `npm run lint`. Vermelho = corrige antes de seguir.
6. **Unit** — `npm test`. Vermelho = corrige antes de seguir. Coverage do diff >= 80%.
7. **E2E** — `npx playwright test`. Captura screenshot/trace/video. Vermelho = corrige.
8. **Fix loop** — se qualquer etapa falhou: volta ao passo 4. Repete até verde.
9. **Commit** — Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`). Mensagem em **inglês**. Body explica *why*, não *what*.
10. **PR** — `gh pr create`. Preenche template inteiro: link da task, evidências (screenshots Playwright), checklist DoD marcado.

---

## Definition of Done

PR só faz merge quando **todos** os itens abaixo estão marcados:

- [ ] Unit tests passam (`npm test` verde)
- [ ] Lint passa (`npm run lint` verde)
- [ ] E2E Playwright passa com **evidência anexada** (screenshot, trace ou video em `playwright-report/`)
- [ ] Coverage do diff >= 80%
- [ ] Acceptance Criteria da task: todos os checkboxes marcados
- [ ] PR template preenchido (link task + descrição + evidências)
- [ ] Conventional commit no merge
- [ ] ADR criado em `.specs/architecture/` se mudou decisão arquitetural
- [ ] Changelog atualizado se release-relevant
- [ ] Sem warning novo no console
- [ ] Sem `console.log` / `print` / `Debug.WriteLine` deixado pra trás
- [ ] Sem TODO sem dono e sem prazo

CI bloqueia merge se DoD falhar (`.github/workflows/dod.yml`).

---

## Padrões de código

Padrões completos em `.specs/architecture/PATTERNS.md`. Resumo:

- Naming, estrutura de pastas, criação de endpoint/componente/teste, tratamento de erro, logging, validação — **tudo lá**.
- Decisões irreversíveis viram **ADR** em `.specs/architecture/ADR-XXX-*.md` (template em `.specs/architecture/ADR-template.md`).
- Antes de escrever código novo: lê `PATTERNS.md` da seção relevante. Não inventa estilo próprio.

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
| O que tá no backlog? | `.specs/sprints/BACKLOG.md` |
| Sprint atual? | `.specs/sprints/sprint-XX/SPRINT.md` |
| Tasks abertas? | `.specs/sprints/sprint-XX/*.task.md` |
| Skills/capacidades reutilizáveis? | `.skills/README.md` + `.skills/*/SKILL.md` |

---

## Proibido

Lista negra. Nada aqui é negociável.

- **Pular testes** — sem unit/E2E = sem merge.
- **Mockar pra fazer passar** — mock só pra isolar dependência externa real (HTTP, DB), nunca pra esconder falha.
- **Commit com vermelho** — lint/test falhando = não commita. Hook `.claude/hooks/pre-commit.sh` bloqueia.
- **Ignorar ADR** — decisão registrada em ADR é lei. Reverter/mudar ADR exige novo ADR ("Supersedes ADR-XXX").
- **Adicionar dependência sem perguntar** — toda nova dep (`npm install`, `dotnet add`, etc.) passa por confirmação humana.
- **Editar arquivo não lido** — lê antes de editar. Sempre.
- **Refactor escondido em PR de feature** — refactor = PR separado.
- **Force push em `main`/`master`** — bloqueado por hook e por settings do repo.
- **Commitar segredo** — `.env`, token, key, senha → nunca. Usa `.gitignore` + secrets manager.
- **Reformatar arquivo inteiro num PR pequeno** — diff polui review.

---

## Skills disponíveis

Skills moram em `.skills/<nome>/SKILL.md` e são capacidades reutilizáveis que o agent invoca quando o trigger casa. Lista atual:

- **`playwright-e2e`** — como escrever teste Playwright neste projeto. Trigger: nova feature de UI ou fluxo end-to-end. Cobre fixtures, page objects, evidências (trace/screenshot/video) e padrões de assert.
- **`conventional-commits`** — regras de commit (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `style:`, `ci:`, `build:`). Trigger: hora de commitar. Inclui exemplos, breaking changes (`!`/`BREAKING CHANGE:`) e scope.
- **`_template`** — base pra criar skill nova. Copia, renomeia pasta, preenche frontmatter (`name`, `description`, `trigger`, `steps`, `dod`).

Detalhes completos: `.skills/README.md`.

---

## Comandos especiais

### Criar nova ADR

```bash
# encontra proximo numero
ls .specs/architecture/ADR-*.md | tail -1
# copia template
cp .specs/architecture/ADR-template.md .specs/architecture/ADR-XXX-<slug>.md
# edita: Status, Contexto, Decisao, Consequencias, Alternativas
# commita junto com a feature que motivou a decisao
```

### Abrir PR

```bash
git push -u origin $(git branch --show-current)
gh pr create --fill        # usa template padrao (.github/PULL_REQUEST_TEMPLATE.md)
gh pr view --web           # abre no browser pra revisar
gh run watch               # acompanha CI
```

### Criar task nova

```bash
cp .specs/sprints/task-template.md .specs/sprints/sprint-XX/<id>-<slug>.task.md
# preenche: Contexto, Acceptance Criteria, Out of scope, Test plan, DoD, Pegadinhas, Links
# adiciona linha em .specs/sprints/BACKLOG.md
```

### Criar skill nova

```bash
cp -R .skills/_template .skills/<nome-da-skill>
# edita SKILL.md: name, description, trigger, steps, padroes, DoD
# referencia em .skills/README.md
```

### Rodar checklist DoD localmente antes de PR

```bash
npm run lint && npm test -- --coverage && npx playwright test
# se tudo verde -> git commit && git push && gh pr create --fill
```

---

## Notas finais pro agent

- **Idioma**: respostas/docs em **pt-BR**, código (vars/funções/classes) em **inglês**, commits em **inglês**.
- **Sem emoji em código**. README/slides ok.
- **Sem resumo no final** de uma resposta. Entrega o trabalho e finaliza.
- **Sem estimativa de tempo** (não tem como prever, não promete).
- **Pergunta apenas em ambiguidade real** do pedido. Não pergunta pra confirmar trabalho de execução.
- **Paralelo é o padrão** — research + read + review independentes rodam simultâneos.
- **Hooks do `.claude/hooks/`** rodam automaticamente: post-edit faz lint/format, pre-commit bloqueia commit vermelho.
