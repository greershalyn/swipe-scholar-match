import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // User client for auth
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { school_email, date_of_birth } = await req.json();
    if (!school_email || typeof school_email !== "string") {
      return new Response(JSON.stringify({ error: "school_email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!date_of_birth || typeof date_of_birth !== "string") {
      return new Response(JSON.stringify({ error: "date_of_birth is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate age >= 16
    const dob = new Date(date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 16) {
      return new Response(JSON.stringify({ error: "You must be at least 16 years old to use Lewte." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailDomain = school_email.split("@")[1]?.toLowerCase();
    if (!emailDomain) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if domain is allowed
    const { data: domainData } = await adminClient
      .from("allowed_school_domains")
      .select("id, school_name")
      .eq("domain", emailDomain)
      .eq("is_active", true)
      .maybeSingle();

    if (!domainData) {
      return new Response(JSON.stringify({ error: "This school email domain is not in our approved list. Please contact support." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Upsert verification record
    const { error: upsertError } = await adminClient
      .from("student_email_verifications")
      .upsert(
        {
          user_id: user.id,
          school_email: school_email.toLowerCase(),
          verification_code: code,
          verified: false,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          date_of_birth: date_of_birth,
        },
        { onConflict: "user_id,school_email" }
      );

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to create verification" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // In production, send an actual email. For now, log the code.
    console.log(`Verification code for ${school_email}: ${code}`);

    return new Response(
      JSON.stringify({ 
        message: "Verification code sent to your school email",
        school_name: domainData.school_name,
        // Remove this in production - only for testing
        debug_code: code,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
