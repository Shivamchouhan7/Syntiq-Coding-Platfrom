import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Ensure local .env overrides any global/system environment variables
dotenv.config({ override: true });

console.log("URL:", process.env.SUPABASE_URL);
console.log("KEY EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;