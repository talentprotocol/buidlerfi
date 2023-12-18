import { createClient } from "@supabase/supabase-js";

import { Database } from "./types";

const supabaseClientAdmin = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY_ADMIN!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export { supabaseClientAdmin };
