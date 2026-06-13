"""
delete_problems.py
------------------
Deletes ALL rows from the Supabase `problems` table in small batches.

Usage:
    PYTHONIOENCODING=utf-8 python delete_problems.py
"""

import os
import sys
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit("[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BATCH_SIZE = 50   # delete 50 IDs at a time


def delete_all_problems():
    print("[*] Fetching all problem IDs from Supabase...")

    # Fetch all IDs first (only id column, no heavy data)
    resp = supabase.table("problems").select("id").execute()
    rows = resp.data or []

    if not rows:
        print("[INFO] No problems found. Nothing to delete.")
        return

    ids = [r["id"] for r in rows]
    total = len(ids)
    print(f"[*] Found {total} problems. Deleting in batches of {BATCH_SIZE}...\n")

    deleted = 0
    errors  = 0

    for start in range(0, total, BATCH_SIZE):
        batch_ids = ids[start : start + BATCH_SIZE]
        end = start + len(batch_ids)
        try:
            supabase.table("problems").delete().in_("id", batch_ids).execute()
            deleted += len(batch_ids)
            print(f"  [OK ] Deleted batch {end}/{total}")
        except Exception as exc:
            errors += len(batch_ids)
            print(f"  [ERR] Batch {start}-{end} failed: {exc}")

        time.sleep(0.5)   # gentle on the API

    print(f"\n[DONE] Deleted: {deleted} | Errors: {errors}")


if __name__ == "__main__":
    # Safety confirmation
    confirm = input(
        "\n[WARNING] This will DELETE ALL problems from your Supabase database.\n"
        "    Type  yes  to confirm: "
    ).strip().lower()

    if confirm != "yes":
        print("[ABORTED] No changes made.")
        sys.exit(0)

    delete_all_problems()
