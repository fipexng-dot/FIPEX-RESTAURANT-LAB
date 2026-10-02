import { createClient } from "npm:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const ROLES = ["manager", "cashier", "kitchen"];

type Me = { id: string; restaurant_id: string };

// Only an active restaurant owner may manage staff
async function requireOwner(req: Request): Promise<Me> {
  const token = (req.headers.get("Authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  if (!token) throw new HttpError("Please sign in", 401);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new HttpError("Please sign in again", 401);

  const { data: p } = await admin
    .from("profiles")
    .select("id,restaurant_id,role,status")
    .eq("id", data.user.id)
    .maybeSingle();
  if (
    !p ||
    p.role !== "restaurant_owner" ||
    p.status === "inactive" ||
    !p.restaurant_id
  ) {
    throw new HttpError("Only the restaurant owner can manage staff", 403);
  }
  return { id: p.id, restaurant_id: p.restaurant_id };
}

// The target must be a non-owner member of the same restaurant
async function requireStaff(id: unknown, me: Me) {
  const staffId = String(id ?? "");
  if (!staffId) throw new HttpError("Staff member is missing");
  if (staffId === me.id)
    throw new HttpError("You cannot change your own account here");
  const { data } = await admin
    .from("profiles")
    .select("id,role,restaurant_id")
    .eq("id", staffId)
    .maybeSingle();
  if (!data || data.restaurant_id !== me.restaurant_id) {
    throw new HttpError("Staff member not found", 404);
  }
  if (data.role === "restaurant_owner") {
    throw new HttpError("The owner account cannot be changed here");
  }
  return staffId;
}

function checkPassword(v: unknown) {
  const p = String(v ?? "");
  if (p.length < 8)
    throw new HttpError("Password must be at least 8 characters");
  return p;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const me = await requireOwner(req);
    const body = await req.json();
    const action = String(body.action ?? "");
    const now = new Date().toISOString();

    if (action === "list") {
      const { data: rows } = await admin
        .from("profiles")
        .select("id,full_name,role,status,phone,created_at")
        .eq("restaurant_id", me.restaurant_id)
        .order("created_at");
      const staff = await Promise.all(
        (rows ?? []).map(async (r) => {
          const { data } = await admin.auth.admin.getUserById(r.id);
          return {
            ...r,
            email: data.user?.email ?? "",
            last_sign_in_at: data.user?.last_sign_in_at ?? null,
          };
        }),
      );
      return reply({ staff });
    }

    if (action === "create") {
      const fullName = String(body.full_name ?? "").trim();
      const email = String(body.email ?? "")
        .trim()
        .toLowerCase();
      const role = String(body.role ?? "");
      const phone = String(body.phone ?? "").trim();
      if (fullName.length < 2)
        throw new HttpError("Please enter the staff member's name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpError("Please enter a valid email address");
      }
      if (!ROLES.includes(role)) throw new HttpError("Please choose a role");
      const password = checkPassword(body.password);

      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (error || !created.user) {
        throw new HttpError(
          /already/i.test(error?.message ?? "")
            ? "That email already has an account"
            : (error?.message ?? "Could not create the login"),
        );
      }

      const { error: profileErr } = await admin.from("profiles").upsert(
        {
          id: created.user.id,
          restaurant_id: me.restaurant_id,
          role,
          full_name: fullName,
          phone: phone || null,
          status: "active",
        },
        { onConflict: "id" },
      );
      if (profileErr) {
        await admin.auth.admin.deleteUser(created.user.id);
        throw new HttpError(profileErr.message, 500);
      }
      return reply({ ok: true, id: created.user.id });
    }

    const staffId = await requireStaff(body.id, me);

    if (action === "set_role") {
      const role = String(body.role ?? "");
      if (!ROLES.includes(role)) throw new HttpError("Please choose a role");
      const { error } = await admin
        .from("profiles")
        .update({ role, updated_at: now })
        .eq("id", staffId);
      if (error) throw new HttpError(error.message, 500);
      return reply({ ok: true });
    }

    if (action === "set_status") {
      const status = body.status === "inactive" ? "inactive" : "active";
      const { error } = await admin
        .from("profiles")
        .update({ status, updated_at: now })
        .eq("id", staffId);
      if (error) throw new HttpError(error.message, 500);
      await admin.auth.admin.updateUserById(staffId, {
        ban_duration: status === "inactive" ? "876000h" : "none",
      });
      return reply({ ok: true });
    }

    if (action === "reset_password") {
      const { error } = await admin.auth.admin.updateUserById(staffId, {
        password: checkPassword(body.password),
      });
      if (error) throw new HttpError(error.message);
      return reply({ ok: true });
    }

    throw new HttpError("Unknown action");
  } catch (err) {
    if (err instanceof HttpError)
      return reply({ error: err.message }, err.status);
    console.error(err);
    return reply({ error: "Something went wrong. Please try again." }, 500);
  }
});
