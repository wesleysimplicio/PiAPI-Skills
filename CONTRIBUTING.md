# Contributing

Thanks for your interest in PiAPI Skills. This is a small focused
single-purpose project. Keep contributions tight.

## Scope

In scope:
- Bug fixes in the CLI or installer.
- New examples for PiAPI families that aren't yet covered.
- Reference updates when PiAPI's surface changes (new models,
  new task types, deprecations).
- Skill metadata tweaks for new agent hosts.

Out of scope:
- Wrappers around alternative inference platforms — fork instead.
- Heavy abstractions, plugin systems, or config DSLs. The CLI is meant to
  stay a thin `requests` client.

## Getting set up

```bash
git clone https://github.com/wesleysimplicio/PiAPI-Skills.git
cd PiAPI-Skills
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip ruff mypy requests
```

Run lints before pushing:

```bash
ruff check .
ruff format --check .
shellcheck install.sh cli/piapi-cli
python -m py_compile cli/cli.py
```

## Pull request checklist

- [ ] Single concern per PR. No drive-by refactors.
- [ ] CLI behavior change → updated docstring **and** an example or
  reference page reflecting it.
- [ ] New model family → entry in `references/models.md` + a row in
  the `README.md` "Surface map" table + (when nontrivial) a cookbook in
  `examples/`.
- [ ] Webhook or auth-related change → review the Security section of
  `CHANGELOG.md` and update if relevant.
- [ ] Lint clean (`ruff`, `shellcheck`, `py_compile`).
- [ ] CHANGELOG entry under `## [Unreleased]` (Added / Changed / Fixed /
  Removed / Security).
- [ ] PR description references the issue it closes (`Closes #N`) when
  applicable.

## Coding conventions

- Python: target 3.10+. No third-party deps beyond `requests`.
- Bash: portable POSIX-ish. `set -euo pipefail` at the top of every script.
- Markdown: 80-col soft wrap, fenced code blocks with language tags.
- Filenames: lowercase, hyphenated for examples, single-word for refs.

## Releases

Maintainer-only:

```bash
# update CHANGELOG.md, bump version in any pinned spot
git tag v<X.Y.Z>
git push origin master --tags
gh release create v<X.Y.Z> --notes-file CHANGELOG.md
```

CI (`.github/workflows/ci.yml`) must be green before tagging.

## Code of conduct

By participating you agree to abide by the
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## License

Contributions are licensed under the MIT terms in [`LICENSE`](LICENSE).
