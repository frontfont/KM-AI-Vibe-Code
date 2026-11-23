# KM-AI Vibe Code Hub — notes for Claude

Central repo for collecting the organisation's AI Vibe Coding projects, auditing them, and publishing them to an internal Hub site.

- Docs are written in Thai; code, comments and commit messages in English.
- `schema/kabac.schema.json` is the single source of truth for `kabac.yaml`. When changing it, update `template/kabac.yaml`, `examples/`, and `docs/KABAC-MANUAL.md` together.
- Audit tier logic lives in `scripts/validate_kabac.py` (`compute_tier`) and is documented in `docs/KABAC-MANUAL.md` and `docs/PROGRAM-PLAN.md` — keep them in sync.
- `.github/workflows/vibe-audit.yml` is a reusable workflow called by every submitter repo; changes affect all submissions.
- Check locally before pushing:
  - `python scripts/validate_kabac.py examples/*/kabac.yaml`
  - `python scripts/scan_skills.py .` and `python scripts/scan_pii.py .`
- Roadmap and open decisions: `docs/PROGRAM-PLAN.md`.
