#!/usr/bin/env python3
"""
automation/check_rates_freshness.py

SAFE automation — replaces the old fake "scraper" that silently overwrote
content/rates.json with hardcoded numbers every day.

What this does instead:
  - Reads content/rates.json's "last_verified" date.
  - If it's older than FRESHNESS_LIMIT_DAYS, writes a flag file that the
    GitHub Actions workflow uses to open a reminder Issue on the repo.
  - It NEVER edits content/rates.json itself. Rate changes only happen when
    a human logs into /admin (Decap CMS) and edits them there — which is
    the correct workflow for financial claims on a lending advisory site.

This keeps the "automation" real (nobody has to remember to check manually)
while keeping the actual decision — what the rate says — in human hands.
"""

from __future__ import annotations

import json
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RATES_FILE = ROOT / "content" / "rates.json"
FLAG_FILE = ROOT / "automation" / "_needs_review.flag"

FRESHNESS_LIMIT_DAYS = 30


def main():
    if not RATES_FILE.exists():
        print(f"[check_rates_freshness] {RATES_FILE} not found — nothing to check.")
        return

    data = json.loads(RATES_FILE.read_text(encoding="utf-8"))
    last_verified_str = data.get("last_verified")

    if not last_verified_str:
        print("[check_rates_freshness] No 'last_verified' field found — flagging for review.")
        FLAG_FILE.write_text("missing_last_verified")
        return

    last_verified = datetime.date.fromisoformat(last_verified_str)
    age_days = (datetime.date.today() - last_verified).days

    print(f"[check_rates_freshness] Rates last verified {age_days} days ago ({last_verified_str}).")

    if age_days > FRESHNESS_LIMIT_DAYS:
        print(f"[check_rates_freshness] Older than {FRESHNESS_LIMIT_DAYS} days — flagging for review.")
        FLAG_FILE.write_text(f"stale:{age_days}")
    else:
        print("[check_rates_freshness] Still fresh — no action needed.")
        if FLAG_FILE.exists():
            FLAG_FILE.unlink()


if __name__ == "__main__":
    main()
