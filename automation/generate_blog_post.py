#!/usr/bin/env python3
"""
automation/generate_blog_post.py (Gemini version)

Real automation: writes a new SEO blog post using the Google Gemini API
(free, non-expiring tier) and adds it to blog/posts/, then rebuilds
blog/index.html. Runs on a schedule via .github/workflows/auto-blog.yml.

Requires the GEMINI_API_KEY GitHub Actions secret.
"""

from __future__ import annotations

import os
import re
import json
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "blog" / "posts"
BLOG_INDEX = ROOT / "blog" / "index.html"
STATE_FILE = ROOT / "automation" / "topic_state.json"

TOPICS = [
    "Documents required for a personal loan in Pune: a complete checklist",
    "Home loan vs loan against property: which one fits your need?",
    "How lenders evaluate loan eligibility: income, age, and employment type explained",
    "5 common mistakes to avoid when applying for a business loan",
    "What is a loan tenure and how does it affect your EMI?",
    "Salaried vs self-employed: how loan eligibility criteria differ",
    "A first-time borrower's guide to understanding loan processing fees",
    "Loan against property: is your Pune property eligible?",
    "Understanding EMI: a plain-language guide for first-time borrowers",
    "Personal loan for medical emergencies: what to know before you apply",
    "Business loan for small shop owners in Pune: a starting guide",
]

SYSTEM_PROMPT = """You are the SEO & Content Writer for loanhelplinepune.in, \
a loan advisory platform (not a lender) based in Pune, India. Write a clear, \
useful, SEO-friendly blog post of 500-700 words on the given topic.

Hard rules:
- NEVER state a specific guaranteed interest rate, approval time, or approval outcome.
- NEVER mention CIBIL, credit score, or any credit bureau check.
- NEVER say "guaranteed approval", "instant approval", "100% approval".
- Always describe loanhelplinepune.in as a loan advisory/referral service, never a lender.
- Plain, warm language a first-time borrower in Pune would understand.
- IMPORTANT: escape every newline as \\n and every double-quote as \\" inside
  the JSON string values. Do not include literal line breaks in the JSON.

Output strict JSON only (no markdown fences, no preamble):
{"title": "...", "meta_description": "...", "slug": "...-hyphenated...", "body_html": "...semantic HTML body, no html/head/body tags..."}
"""


def get_next_topic() -> tuple[str, int]:
    state = {"last_index": -1}
    if STATE_FILE.exists():
        state = json.loads(STATE_FILE.read_text())
    idx = (state.get("last_index", -1) + 1) % len(TOPICS)
    return TOPICS[idx], idx


def save_state(index: int) -> None:
    STATE_FILE.write_text(json.dumps({"last_index": index, "updated_at": str(datetime.datetime.now(datetime.timezone.utc))}))


def call_gemini(topic: str) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        slug = re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")
        return {
            "title": topic,
            "meta_description": f"{topic} — a guide from LoanHelpline Pune.",
            "slug": slug,
            "body_html": f"<p>[DEMO MODE — set GEMINI_API_KEY secret for a real article]</p><p>{topic}</p>",
        }

    import google.generativeai as genai

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json"},
    )
    response = model.generate_content(f"Topic: {topic}")
    text = response.text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(text, strict=False)


POST_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title} | LoanHelpline Pune</title>
<meta name="description" content="{meta_description}" />
<link rel="stylesheet" href="../../assets/blog.css" />
</head>
<body>
<header class="post-header"><a href="../../index.html">← LoanHelpline Pune</a></header>
<main class="post">
  <p class="post-date">{date}</p>
  <h1>{title}</h1>
  <article>{body_html}</article>
  <p class="post-disclaimer">This article is educational and general in nature. It does not
  constitute financial advice. Loan eligibility, rates, and approval are determined solely by
  the lending partner. LoanHelpline Pune is a loan advisory/referral service, not a lender.</p>
</main>
</body>
</html>
"""


def write_post(article: dict) -> Path:
    date_str = datetime.date.today().isoformat()
    path = POSTS_DIR / f"{date_str}-{article['slug']}.html"
    path.write_text(POST_TEMPLATE.format(
        title=article["title"], meta_description=article["meta_description"],
        body_html=article["body_html"], date=date_str,
    ), encoding="utf-8")
    return path


def rebuild_blog_index() -> None:
    posts = sorted(POSTS_DIR.glob("*.html"), reverse=True)
    items = []
    for p in posts:
        m = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)\.html", p.name)
        date_str = m.group(1) if m else ""
        content = p.read_text(encoding="utf-8")
        h1 = re.search(r"<h1>(.*?)</h1>", content)
        title = h1.group(1) if h1 else p.stem
        items.append(f'<li><span class="d">{date_str}</span> <a href="posts/{p.name}">{title}</a></li>')

    BLOG_INDEX.write_text(f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Blog | LoanHelpline Pune</title>
<link rel="stylesheet" href="../assets/blog.css" />
</head>
<body>
<header class="post-header"><a href="../index.html">← LoanHelpline Pune</a></header>
<main class="post">
  <h1>Loan guides &amp; articles</h1>
  <ul class="post-list">{''.join(items) if items else '<li>No posts yet.</li>'}</ul>
</main>
</body>
</html>
""", encoding="utf-8")


def main():
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    topic, index = get_next_topic()
    print(f"[generate_blog_post] Topic: {topic}")
    article = call_gemini(topic)
    path = write_post(article)
    print(f"[generate_blog_post] Wrote: {path}")
    rebuild_blog_index()
    save_state(index)
    print("[generate_blog_post] Done.")


if __name__ == "__main__":
    main()
