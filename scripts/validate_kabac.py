#!/usr/bin/env python3
"""Validate kabac.yaml files against the KABAC schema and compute the audit tier.

Usage:
    python scripts/validate_kabac.py path/to/kabac.yaml [more.yaml ...]

Exit code is non-zero if any file is invalid. When running in GitHub Actions,
the tier is written to $GITHUB_OUTPUT and a summary to $GITHUB_STEP_SUMMARY.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "schema" / "kabac.schema.json"
PLACEHOLDERS = ("...", "ชื่อโครงการ", "project-slug", "สรุปหนึ่งประโยค")

TIER_INFO = {
    "T1": "Low — AI CoE review (3 business days)",
    "T2": "Medium — AI CoE + Security (7 business days)",
    "T3": "High — AI CoE + Security + DPO/Legal/Compliance (14 business days)",
}


def compute_tier(reuse: dict) -> str:
    if reuse.get("data_classification") == "restricted_pii" or reuse.get("decision_impact") == "financial_or_hr":
        return "T3"
    if reuse.get("data_classification") == "confidential" or reuse.get("connects_internal_systems"):
        return "T2"
    return "T1"


def find_placeholders(node, path="") -> list[str]:
    hits = []
    if isinstance(node, dict):
        for k, v in node.items():
            hits += find_placeholders(v, f"{path}.{k}" if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            hits += find_placeholders(v, f"{path}[{i}]")
    elif isinstance(node, str) and any(p in node for p in PLACEHOLDERS):
        hits.append(path)
    return hits


def validate(path: Path, validator: Draft202012Validator) -> tuple[list[str], dict | None]:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        return [f"cannot read YAML: {exc}"], None
    if not isinstance(data, dict):
        return ["file is empty or not a mapping"], None

    errors = [
        f"{'/'.join(map(str, e.absolute_path)) or '(root)'}: {e.message}"
        for e in sorted(validator.iter_errors(data), key=lambda e: list(map(str, e.absolute_path)))
    ]

    adr_ids = [a.get("id") for a in data.get("adr", []) if isinstance(a, dict)]
    dupes = {i for i in adr_ids if adr_ids.count(i) > 1}
    if dupes:
        errors.append(f"adr: duplicate ids {sorted(dupes)}")

    for hit in find_placeholders(data):
        errors.append(f"{hit}: still contains template placeholder text")

    return errors, data


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__)
        return 2

    validator = Draft202012Validator(json.loads(SCHEMA_PATH.read_text(encoding="utf-8")))
    summary = ["## KABAC validation", ""]
    failed = False
    tiers = []

    for arg in argv:
        path = Path(arg)
        errors, data = validate(path, validator)
        if errors:
            failed = True
            print(f"❌ {path}")
            for e in errors:
                print(f"   - {e}")
            summary.append(f"❌ `{path}`")
            summary += [f"  - {e}" for e in errors]
            continue

        tier = compute_tier(data["reuse"])
        tiers.append(tier)
        project = data["meta"]["project"]
        print(f"✅ {path} — {project} — Audit tier {tier}: {TIER_INFO[tier]}")
        summary.append(f"✅ `{path}` — **{project}** — Audit tier **{tier}**: {TIER_INFO[tier]}")

    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as fh:
            fh.write("\n".join(summary) + "\n")
    if os.environ.get("GITHUB_OUTPUT") and tiers:
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as fh:
            fh.write(f"tier={max(tiers)}\n")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
