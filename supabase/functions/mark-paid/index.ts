import { createClient } from "npm:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
const reply = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } })

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "")
    const { data: u } = await admin.auth.getUser(token)
    if (!u?.user) return reply({ error: "Please sign in again" }, 401)
    const { data: p } = await admin.from("profiles").select("restaurant_id,role,status").eq("id", u.user.id).maybeSingle()
    if (!p?.restaurant_id || p.status === "inactive" || !["restaurant_owner", "manager", "cashier"].includes(p.role))
      return reply({ error: "You are not allowed to do this" }, 403)
    const b = await req.json()
    const method = String(b.method ?? "")
    if (!["cash", "pos", "transfer"].includes(method)) return reply({ error: "Choose a payment method" }, 400)
    const ref = String(b.reference ?? "").trim().slice(0, 40)
    const { data: o } = await admin.from("orders").select("id,order_number,total,payment_status")
      .eq("id", String(b.order_id ?? "")).eq("restaurant_id", p.restaurant_id).maybeSingle()
    if (!o) return reply({ error: "Order not found" }, 404)
    if (o.payment_status === "success") return reply({ error: "Already paid" }, 400)
    const now = new Date().toISOString()
    const { error: e1 } = await admin.from("payments").insert({
      restaurant_id: p.restaurant_id, order_id: o.id, provider: method,
      reference: `${method.toUpperCase()}-${o.order_number ?? o.id.slice(0, 6)}-${Date.now()}`,
      amount: o.total, currency: "NGN", status: "success", paid_at: now,
      metadata: { note: ref || null, created_by: u.user.id },
    })
    if (e1) return reply({ error: e1.message }, 500)
    const { error: e2 } = await admin.from("orders")
      .update({ payment_status: "success", payment_method: method, payment_reference: ref || null }).eq("id", o.id)
    if (e2) return reply({ error: e2.message }, 500)
    return reply({ ok: true })
  } catch (e) {
    return reply({ error: (e as Error).message }, 500)
  }
})
