#!/usr/bin/env python3
"""
automation/daily_agent.py

The "one master prompt, ongoing autonomous work" agent — implemented safely.

What it does, every time it runs (see .github/workflows/daily-agent.yml):
  1. Reads the current homepage and a few key pages as context.
  2. Sends a MASTER_SYSTEM_PROMPT (written once, below) + that context to Claude.
  3. Claude decides, on its own, whether there's ONE small, safe improvement
     worth making today (clearer wording, better SEO meta text, a missing
     but harmless detail, etc.) and returns the exact new file content.
  4. The script writes that file locally. The GitHub Actions workflow then
     opens a Pull Request with the change — it is NEVER pushed directly to
     the live site. A human (you) reviews and merges with one click.

Hard boundaries (enforced in the prompt AND by which files the agent is
even allowed to touch):
  - The agent NEVER edits content/rates.json or content/offer.json — those
    are compliance-sensitive and stay under direct human control via the
    /admin panel (Decap CMS) only.
  - The agent NEVER invents specific interest rates, approval times, or
    guarantees.
  - The agent may propose at most ONE change per run, to keep every PR
    small and easy to review in seconds.
"""

from __future__ import annotations

import os
import json
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ALLOWED_FILES = [
    "index.html",
    "about.html",
    "contact.html",
]

MASTER_SYSTEM_PROMPT = """You are the ongoing site-improvement agent for
loanhelplinepune.in, a loan advisory website (not a lender) in Pune, India.

Your job, once per day: look at the current site content given to you and
decide if there is ONE small, genuinely valuable improvement worth making
today. Examples of good suggestions: clearer or more persuasive wording in
a section, a better SEO meta description, fixing awkward phrasing, adding
a small missing-but-harmless detail (like a service benefit), improving
accessibility text (alt text, aria-labels).

Hard rules — you must never violate these:
- NEVER touch, mention, or invent a specific interest rate, processing fee
  percentage, approval time, or approval guarantee. Those are managed
  separately by a human via the admin panel and are strictly off-limits.
- NEVER change WhatsApp phone numbers, links, or any contact details.
- NEVER change the overall page structure, ids, classes, or data-key
  attributes used by the site's JavaScript — only edit text content and
  minor copy within the existing structure.
- NEVER claim something is "guaranteed", "instant", or "100%".
- You may propose editing ONLY these files: index.html, about.html,
  contact.html. If none of them need a change today, say so honestly.
- If you are not confident a change is a genuine improvement, do NOT
  propose one just to have something to do. "No change today" is a valid
  and often correct answer.

Respond with STRICT JSON only, no markdown fences, no preamble:
{
  "has_suggestion": true or false,
  "target_file": "index.html" | "about.html" | "contact.html" | null,
  "reasoning": "one or two sentences explaining why this helps, for a human reviewer",
  "new_file_content": "the FULL new content of the file if has_suggestion is true, else null"
}
"""


def read_context() -> dict:
    context = {}
    for filename in ALLOWED_FILES:
        path = ROOT / filename
        if path.exists():
            context[filename] = path.read_text(encoding="utf-8")
    return context


def call_claude(context: dict) -> dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("[daily_agent] No ANTHROPIC_API_KEY set — skipping (demo mode has nothing safe to propose).")
        return {"has_suggestion": False, "target_file": None, "reasoning": "No API key configured.", "new_file_content": None}

    import anthropic

    client = anthropic.Anthropic(api_key=api_key)

    user_message = (
        "Here is the current content of the allowed files:\n\n"
        + "\n\n".join(f"=== {name} ===\n{content}" for name, content in context.items())
        + "\n\nDecide if there's one small, safe improvement worth making today."
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8000,
        system=MASTER_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    text = "".join(b.text for b in response.content if b.type == "text")
    text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(text)


def apply_suggestion(suggestion: dict) -> bool:
    if not suggestion.get("has_suggestion"):
        print(f"[daily_agent] No change proposed today. Reasoning: {suggestion.get('reasoning')}")
        return False

    target = suggestion.get("target_file")
    if target not in ALLOWED_FILES:
        print(f"[daily_agent] Refusing suggestion for disallowed file: {target}")
        return False

    new_content = suggestion.get("new_file_content")
    if not new_content:
        print("[daily_agent] Suggestion had no content — skipping.")
        return False

    path = ROOT / target
    path.write_text(new_content, encoding="utf-8")

    summary_path = ROOT / "automation" / "_last_suggestion.json"
    summary_path.write_text(json.dumps({
        "file": target,
        "reasoning": suggestion.get("reasoning"),
        "date": datetime.date.today().isoformat(),
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[daily_agent] Proposed change to {target}: {suggestion.get('reasoning')}")
    return True


def main():
    context = read_context()
    suggestion = call_claude(context)
    changed = apply_suggestion(suggestion)
    exit(0 if changed else 1)


if __name__ == "__main__":
    main()
