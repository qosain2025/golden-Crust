// ============================================
// THE GOLDEN CRUST - SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = "https://prxydbmqoujoohzrzkqh.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_-eAJcsGE2WZXsCoocf_g_A10zmV_Q";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);