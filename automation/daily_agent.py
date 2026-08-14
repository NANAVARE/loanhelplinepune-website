#!/usr/bin/env python3
"""
automation/daily_agent.py (Gemini version)

Same "one master prompt, ongoing autonomous work" agent as before, now
powered by Google Gemini (which has a genuine, non-expiring free tier)
instead of the Anthropic API.

Requires the GEMINI_API_KEY GitHub Actions secret. Get a free key at
https://aistudio.google.com/apikey — no credit card needed, and the free
tier does not expire.
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


def call_gemini(context: dict) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[daily_agent] No GEMINI_API_KEY set — skipping (nothing safe to propose).")
        return {"has_suggestion": False, "target_file": None, "reasoning": "No API key configured.", "new_file_content": None}

    import google.generativeai as genai

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=MASTER_SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json"},
    )

    user_message = (
        "Here is the current content of the allowed files:\n\n"
        + "\n\n".join(f"=== {name} ===\n{content}" for name, content in context.items())
        + "\n\nDecide if there's one small, safe improvement worth making today."
    )

    response = model.generate_content(user_message)
    text = response.text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
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
    suggestion = call_gemini(context)
    changed = apply_suggestion(suggestion)
    exit(0 if changed else 1)


if __name__ == "__main__":
    main()
