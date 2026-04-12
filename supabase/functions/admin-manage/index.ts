import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user roles
    const { data: userRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const roles = (userRoles || []).map((r: any) => r.role);
    const isSuperAdmin = roles.includes("super_admin");
    const isAdvertiser = roles.includes("advertiser");
    const isSchoolAdmin = roles.includes("school_admin");
    const isModerator = roles.includes("moderator");

    if (roles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, table, data, id } = body;

    if (!action || !table) {
      return new Response(JSON.stringify({ error: "action and table required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Table access control by role
    const tablePermissions: Record<string, string[]> = {
      allowed_school_domains: ["super_admin"],
      coupons: ["super_admin", "advertiser"],
      surveys: ["super_admin", "school_admin"],
      survey_questions: ["super_admin", "school_admin"],
      survey_school_targets: ["super_admin", "school_admin"],
      notifications: ["super_admin", "school_admin"],
      student_email_verifications: ["super_admin"],
      user_roles: ["super_admin"],
      coupon_analytics: ["super_admin", "advertiser"],
      profiles: ["super_admin"],
      promo_codes: ["super_admin"],
      promo_code_redemptions: ["super_admin"],
    };

    const allowedRoles = tablePermissions[table];
    if (!allowedRoles) {
      return new Response(JSON.stringify({ error: "Invalid table" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasAccess = roles.some((r: string) => allowedRoles.includes(r));
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "Insufficient permissions for this table" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For non-super-admin, scope data to their ownership
    let result;
    switch (action) {
      case "list": {
        let query = adminClient.from(table).select("*");
        // Scope for non-super-admins
        if (!isSuperAdmin && table === "coupons" && isAdvertiser) {
          query = query.eq("owner_id", user.id);
        }
        if (!isSuperAdmin && (table === "surveys" || table === "survey_questions") && isSchoolAdmin) {
          if (table === "surveys") {
            query = query.eq("owner_id", user.id);
          }
          // survey_questions: filter by survey ownership in post-processing
        }
        if (table === "coupon_analytics") {
          // For advertisers, only their coupons' analytics
          if (!isSuperAdmin && isAdvertiser) {
            const { data: myCoupons } = await adminClient.from("coupons").select("id").eq("owner_id", user.id);
            const couponIds = (myCoupons || []).map((c: any) => c.id);
            if (couponIds.length > 0) {
              query = query.in("coupon_id", couponIds);
            } else {
              return new Response(JSON.stringify({ data: [] }), {
                status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          }
        }
        result = await query.order("created_at", { ascending: false });
        break;
      }
      case "create": {
        const insertData = { ...data };
        // Auto-set owner_id for non-super-admins
        if ((table === "coupons" || table === "surveys") && !isSuperAdmin) {
          insertData.owner_id = user.id;
        }
        result = await adminClient.from(table).insert(insertData).select();
        break;
      }
      case "update":
        if (!id) return new Response(JSON.stringify({ error: "id required for update" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        result = await adminClient.from(table).update(data).eq("id", id).select();
        break;
      case "delete":
        if (!id) return new Response(JSON.stringify({ error: "id required for delete" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        result = await adminClient.from(table).delete().eq("id", id);
        break;
      case "list_users": {
        // Super admin only: list only users who have admin roles
        if (!isSuperAdmin) {
          return new Response(JSON.stringify({ error: "Super admin required" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data: allRoles } = await adminClient.from("user_roles").select("*");
        // Get unique user IDs that have roles
        const adminUserIds = [...new Set((allRoles || []).map((r: any) => r.user_id))];
        // Fetch only those users from auth
        const adminUsers = [];
        for (const uid of adminUserIds) {
          const { data: { user: adminUser } } = await adminClient.auth.admin.getUserById(uid as string);
          if (adminUser) {
            adminUsers.push({
              id: adminUser.id,
              email: adminUser.email,
              created_at: adminUser.created_at,
              roles: (allRoles || []).filter((r: any) => r.user_id === adminUser.id).map((r: any) => r.role),
            });
          }
        }
        return new Response(JSON.stringify({ data: adminUsers }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "create_admin": {
        // Super admin only: create a new auth user and assign a role
        if (!isSuperAdmin) {
          return new Response(JSON.stringify({ error: "Super admin required" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { email: newEmail, password: newPassword, role: newRole } = data;
        if (!newEmail || !newPassword || !newRole) {
          return new Response(JSON.stringify({ error: "email, password, and role required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const validRoles = ["advertiser", "school_admin", "moderator"];
        if (!validRoles.includes(newRole)) {
          return new Response(JSON.stringify({ error: "Invalid role. Must be: " + validRoles.join(", ") }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Create the auth user
        const { data: newUserData, error: createError } = await adminClient.auth.admin.createUser({
          email: newEmail,
          password: newPassword,
          email_confirm: true,
        });
        if (createError) {
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Assign the role
        const { error: roleError } = await adminClient.from("user_roles").insert({
          user_id: newUserData.user.id,
          role: newRole,
        });
        if (roleError) {
          return new Response(JSON.stringify({ error: roleError.message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ data: { id: newUserData.user.id, email: newEmail, role: newRole } }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "delete_admin": {
        // Super admin only: remove all roles and delete the auth user
        if (!isSuperAdmin) {
          return new Response(JSON.stringify({ error: "Super admin required" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { user_id: delUserId } = data;
        if (!delUserId) {
          return new Response(JSON.stringify({ error: "user_id required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Prevent deleting yourself
        if (delUserId === user.id) {
          return new Response(JSON.stringify({ error: "Cannot delete your own account" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Remove roles
        await adminClient.from("user_roles").delete().eq("user_id", delUserId);
        // Delete auth user
        const { error: delError } = await adminClient.auth.admin.deleteUser(delUserId);
        if (delError) {
          return new Response(JSON.stringify({ error: delError.message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ data: { deleted: true } }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "assign_role": {
        if (!isSuperAdmin) {
          return new Response(JSON.stringify({ error: "Super admin required" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { user_id: targetUserId, role } = data;
        if (!targetUserId || !role) {
          return new Response(JSON.stringify({ error: "user_id and role required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        result = await adminClient.from("user_roles").insert({ user_id: targetUserId, role }).select();
        break;
      }
      case "remove_role": {
        if (!isSuperAdmin) {
          return new Response(JSON.stringify({ error: "Super admin required" }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { user_id: rmUserId, role: rmRole } = data;
        result = await adminClient.from("user_roles").delete().eq("user_id", rmUserId).eq("role", rmRole);
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: result?.data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
