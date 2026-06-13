import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

resp = supabase.table("problems").select("id", count="exact").execute()
print(f"Remaining problems in DB: {resp.count}")
