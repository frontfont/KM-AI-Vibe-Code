#!/usr/bin/env python3
"""Scan repository files for personal data (PDPA) that must not be committed.

Detects:
  * Thai national ID numbers (13 digits, checksum verified to cut false positives)
  * Thai mobile phone numbers
  * Email addresses (excluding obvious example/placeholder domains)

Usage:
    python scripts/scan_pii.py [repo_root]

Exit code 1 if a Thai national ID is found; phone/email findings are warnings.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "dist", "build", "__pycache__"}
TEXT_EXT = {".csv", ".json", ".txt", ".md", ".yaml", ".yml", ".xml", ".sql", ".tsv",
            ".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".env", ".log", ".ini", ".toml"}
MAX_BYTES = 5_000_000

THAI_ID = re.compile(r"(?<!\d)(\d[- ]?\d{4}[- ]?\d{5}[- ]?\d{2}[- ]?\d)(?!\d)")
THAI_MOBILE = re.compile(r"(?<![\d+])(?:\+66[- ]?|0)[689]\d[- ]?\d{3}[- ]?\d{4}(?!\d)")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}")
SAFE_EMAIL_DOMAINS = ("example.com", "example.org", "example.co.th", "test.com",
                      "anthropic.com", "users.noreply.github.com", "localhost")


def valid_thai_id(raw: str) -> bool:
    digits = [int(c) for c in raw if c.isdigit()]
    if len(digits) != 13 or digits[0] == 0:
        return False
    total = sum(d * (13 - i) for i, d in enumerate(digits[:12]))
    return (11 - total % 11) % 10 == digits[12]


def iter_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            p = Path(dirpath) / name
            if (p.suffix.lower() in TEXT_EXT or name.startswith(".env")) and name != ".env.example":
                yield p


def main(argv: list[str]) -> int:
    root = Path(argv[0] if argv else ".").resolve()
    ids = warns = 0
    for path in iter_files(root):
        if path.stat().st_size > MAX_BYTES:
            continue
        rel = path.relative_to(root)
        text = path.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), 1):
            for m in THAI_ID.finditer(line):
                if valid_thai_id(m.group(1)):
                    ids += 1
                    print(f"[HIGH] {rel}:{lineno} — Thai national ID number")
                    if os.environ.get("GITHUB_ACTIONS"):
                        print(f"::error file={rel},line={lineno}::Thai national ID number found")
            for _ in THAI_MOBILE.finditer(line):
                warns += 1
                print(f"[WARN] {rel}:{lineno} — Thai mobile number")
            for m in EMAIL.finditer(line):
                if not m.group(0).lower().endswith(SAFE_EMAIL_DOMAINS):
                    warns += 1
                    print(f"[WARN] {rel}:{lineno} — email address")

    print(f"\n{ids} national ID(s), {warns} warning(s). Values are not printed on purpose.")
    return 1 if ids else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
