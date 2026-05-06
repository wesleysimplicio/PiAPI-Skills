## Summary

<!-- 1–3 sentences on what this PR changes and why. -->

## Type of change

- [ ] Bug fix
- [ ] New feature / model family / agent host
- [ ] Documentation only
- [ ] CI / tooling
- [ ] Refactor (no behavior change)

## Linked issue

<!-- e.g., Closes #123. Optional but encouraged. -->

## Verification

```bash
ruff check .
ruff format --check .
shellcheck install.sh cli/piapi-cli
python -m py_compile cli/cli.py
```

Plus, if the change touches the CLI surface:

```bash
bash install.sh --yes --agents generic
piapi-cli --help
piapi-cli verify-webhook --header-secret deadbeef --expected deadbeef
```

## Checklist

- [ ] Single concern. No drive-by refactors.
- [ ] Lints pass locally.
- [ ] Updated `references/` or `examples/` if behavior changed.
- [ ] Updated `README.md` "Surface map" if a new family was added.
- [ ] Added a `CHANGELOG.md` entry.
- [ ] No secrets, no real API keys, no real webhook secrets in diffs or logs.

## Screenshots / output

<!-- Optional. Paste CLI output, screenshots, or pasted webhook payloads (redacted). -->
