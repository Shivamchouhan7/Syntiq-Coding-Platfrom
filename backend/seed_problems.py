"""
Seed script: Load LeetCode problems from HuggingFace and insert into Supabase.

Dataset: newfacade/LeetCodeDataset
Fields used:
  task_id            -> slug / title source
  question_id        -> numeric problem ID
  difficulty         -> Easy / Medium / Hard
  tags               -> category (first tag)
  problem_description -> statement
  starter_code       -> Python starter code
  completion         -> editorial / model solution
  input_output       -> test cases [{input, output}]

Install dependencies:
    python -m pip install datasets supabase python-dotenv

Usage:
    python seed_problems.py                    # seed all problems
    python seed_problems.py --limit 100        # seed first 100
    python seed_problems.py --difficulty Easy  # Easy only
"""

import os
import ast
import sys
import time
import argparse
from dotenv import load_dotenv
from datasets import load_dataset
from supabase import create_client, Client

# ── Load .env ─────────────────────────────────────────────────────────────────
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Helpers ───────────────────────────────────────────────────────────────────

def normalize_difficulty(diff: str) -> str:
    d = (diff or "").strip().lower()
    return {"easy": "Easy", "medium": "Medium", "hard": "Hard"}.get(d, "Medium")


def slug_to_title(slug: str) -> str:
    """Convert 'two-sum' -> 'Two Sum'"""
    return " ".join(word.capitalize() for word in slug.replace("-", " ").split())


def parse_tags(tags_str: str) -> list[str]:
    """Parse tags string like \"['Array', 'Hash Table']\" into a Python list."""
    try:
        result = ast.literal_eval(tags_str or "[]")
        return result if isinstance(result, list) else []
    except Exception:
        return []


def parse_input_output(io_str: str) -> list[dict]:
    """Parse input_output field (string of list of dicts) into a list of {input, output}."""
    try:
        cases = ast.literal_eval(io_str or "[]")
        if isinstance(cases, list):
            return [
                {"input": str(c.get("input", "")), "output": str(c.get("output", ""))}
                for c in cases
                if isinstance(c, dict)
            ][:5]
    except Exception:
        pass
    return []


def map_row(row: dict, index: int) -> dict | None:
    """Map a dataset row to the Supabase problems table schema."""

    task_id     = (row.get("task_id") or "").strip()
    question_id = row.get("question_id") or str(index)

    # Build a human-readable title from the slug
    title = slug_to_title(task_id) if task_id else ""
    if not title:
        return None

    try:
        problem_id = int(question_id)
    except (ValueError, TypeError):
        problem_id = index

    difficulty = normalize_difficulty(row.get("difficulty") or "Medium")

    # Category from first tag
    tags     = parse_tags(row.get("tags") or "[]")
    category = tags[0] if tags else "General"

    statement   = (row.get("problem_description") or "").strip()
    editorial   = (row.get("completion") or "").strip()
    test_cases  = parse_input_output(row.get("input_output") or "[]")

    # Starter code — dataset only has Python
    raw_starter = (row.get("starter_code") or "").strip()
    starter_code = {"python": raw_starter} if raw_starter else {}

    return {
        "id":           problem_id,
        "title":        title,
        "difficulty":   difficulty,
        "acceptance":   "0.0%",        # not available in this dataset
        "category":     category,
        "statement":    statement,
        "constraints":  [],            # not separately available
        "starter_code": starter_code,
        "test_cases":   test_cases,
        "editorial":    editorial,
        "recommended":  False,
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def seed(limit: int | None = None, difficulty: str | None = None, batch_size: int = 50):
    print("[*] Loading LeetCodeDataset from HuggingFace (cached after first run)...")
    ds = load_dataset("newfacade/LeetCodeDataset", split="train")
    print(f"[OK] Dataset loaded - {len(ds)} rows total")

    problems = []
    skipped  = 0

    for i, row in enumerate(ds):
        if limit and len(problems) >= limit:
            break

        if difficulty:
            if normalize_difficulty(row.get("difficulty") or "").lower() != difficulty.lower():
                continue

        mapped = map_row(row, i + 1)
        if mapped is None:
            skipped += 1
            continue

        problems.append(mapped)

    print(f"[*] Mapped {len(problems)} problems | skipped {skipped} rows")

    if not problems:
        print("[WARN] Nothing to insert.")
        return

    # Deduplicate by id (keep last occurrence)
    seen = {}
    for p in problems:
        seen[p["id"]] = p
    problems = list(seen.values())
    print(f"[*] After deduplication: {len(problems)} unique problems")

    # Upsert in batches
    inserted = 0
    errors   = 0
    for start in range(0, len(problems), batch_size):
        batch = problems[start : start + batch_size]
        try:
            supabase.table("problems").upsert(batch, on_conflict="id").execute()
            inserted += len(batch)
            end = start + len(batch)
            print(f"  [OK] Upserted {start + 1}-{end} ({end}/{len(problems)})")
        except Exception as e:
            errors += len(batch)
            print(f"  [ERR] Batch {start}-{start + len(batch)} failed: {e}")
        time.sleep(0.2)

    print(f"\n[DONE] Inserted/updated: {inserted} | Errors: {errors}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed Supabase problems from HuggingFace LeetCodeDataset")
    parser.add_argument("--limit",      type=int, default=None, help="Max problems to seed (default: all)")
    parser.add_argument("--difficulty", type=str, default=None, help="Filter: Easy | Medium | Hard")
    parser.add_argument("--batch-size", type=int, default=50,   help="Upsert batch size (default: 50)")
    args = parser.parse_args()

    seed(limit=args.limit, difficulty=args.difficulty, batch_size=args.batch_size)
