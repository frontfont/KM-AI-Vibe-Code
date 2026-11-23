#!/usr/bin/env python3
"""Heuristic scanner for risky instructions in Skills, prompts and agent configs.

Skills run with the permissions of whoever installs them, so a single malicious
skill shared across the group can leak data from every company. This scanner
flags patterns a human reviewer must look at; it does not replace that review.

Usage:
    python scripts/scan_skills.py [repo_root]

Exit code 1 if any HIGH finding is present.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

SCAN_DIRS = ("skills", "prompts", "agents", ".claude", ".cursor", ".github/copilot")
SCAN_FILES = ("CLAUDE.md", "AGENTS.md", ".cursorrules", "GEMINI.md")
SCAN_EXT = {".md", ".txt", ".yaml", ".yml", ".json", ".toml", ".sh", ".py", ".js", ".ts"}
MAX_BYTES = 1_000_000

RULES: list[tuple[str, str, re.Pattern]] = [
    ("HIGH", "download piped into a shell",
     re.compile(r"(curl|wget)[^\n|]*\|\s*(ba|z)?sh\b", re.I)),
    ("HIGH", "reads credential files",
     re.compile(r"(~|\$HOME)?/?\.(ssh|aws|azure|kube|gnupg|docker)/|id_rsa|credentials\.json|\.netrc", re.I)),
    ("HIGH", "known exfiltration / tunnel endpoint",
     re.compile(r"webhook\.site|requestbin|pipedream\.net|ngrok\.io|ngrok-free|pastebin\.com|transfer\.sh|interactsh|burpcollaborator", re.I)),
    ("HIGH", "instruction to ignore or bypass safety rules",
     re.compile(r"ignore (all |any )?(previous|prior|above) instructions|disregard (the )?(system|safety)|bypass (the )?(guardrail|safety|policy)|do not tell the user", re.I)),
    ("HIGH", "decodes and executes obfuscated payload",
     re.compile(r"base64\s+(-d|--decode)[^\n]*\|\s*(ba|z)?sh|eval\s*\(\s*(atob|base64)", re.I)),
    ("MEDIUM", "dumps environment variables",
     re.compile(r"\bprintenv\b|\benv\s*\||os\.environ\b(?!\.get)|process\.env\s*\)", re.I)),
    ("MEDIUM", "destructive file operation",
     re.compile(r"rm\s+-rf\s+(/|~|\$HOME|\*)", re.I)),
    ("MEDIUM", "dynamic code execution",
     re.compile(r"\beval\s*\(|\bexec\s*\(|subprocess\.[a-z_]+\([^)]*shell\s*=\s*True", re.I)),
    ("MEDIUM", "disables permission prompts / sandbox",
     re.compile(r"--dangerously-skip-permissions|bypassPermissions|dangerouslyDisableSandbox|--no-sandbox", re.I)),
    ("LOW", "outbound HTTP call (check the destination)",
     re.compile(r"https?://(?!github\.com|localhost|127\.0\.0\.1)[\w.-]+\.[a-z]{2,}", re.I)),
]


def candidate_files(root: Path):
    seen = set()
    for d in SCAN_DIRS:
        base = root / d
        if base.is_dir():
            for p in base.rglob("*"):
                if p.is_file() and p.suffix.lower() in SCAN_EXT:
                    seen.add(p)
    for name in SCAN_FILES:
        for p in root.rglob(name):
            if ".git" not in p.parts and "node_modules" not in p.parts:
                seen.add(p)
    for p in root.rglob("SKILL.md"):
        if "node_modules" not in p.parts:
            seen.add(p)
    return sorted(seen)


def main(argv: list[str]) -> int:
    root = Path(argv[0] if argv else ".").resolve()
    findings = []
    files = candidate_files(root)
    for path in files:
        if path.stat().st_size > MAX_BYTES:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for lineno, line in enumerate(text.splitlines(), 1):
            for severity, label, rx in RULES:
                if rx.search(line):
                    findings.append((severity, path.relative_to(root), lineno, label, line.strip()[:160]))

    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    findings.sort(key=lambda f: (order[f[0]], str(f[1]), f[2]))
    print(f"Scanned {len(files)} skill/prompt/agent file(s)")
    for sev, path, lineno, label, snippet in findings:
        print(f"[{sev}] {path}:{lineno} — {label}\n        {snippet}")
        if os.environ.get("GITHUB_ACTIONS") and sev != "LOW":
            level = "error" if sev == "HIGH" else "warning"
            print(f"::{level} file={path},line={lineno}::{label}")

    high = sum(1 for f in findings if f[0] == "HIGH")
    print(f"\n{high} HIGH, {sum(1 for f in findings if f[0] == 'MEDIUM')} MEDIUM, "
          f"{sum(1 for f in findings if f[0] == 'LOW')} LOW")
    return 1 if high else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
