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

const ORDER_TYPES = ["dine_in", "takeaway", "delivery"];
const METHODS = ["cash", "pos", "transfer", "pay_later"];
const isSoldOut = (a: string) => /sold|out|unavail/i.test(a || "");

type Me = { id: string; restaurant_id: string };

async function requireStaff(req: Request): Promise<Me> {
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
  const allowed = ["restaurant_owner", "manager", "cashier"];
  if (
    !p ||
    !p.restaurant_id ||
    p.status === "inactive" ||
    !allowed.includes(p.role)
  ) {
    throw new HttpError("You are not allowed to create counter orders", 403);
  }
  return { id: p.id, restaurant_id: p.restaurant_id };
}

function normalizePhone(raw: unknown): string | null {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("234")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  if (!/^[789][01]\d{8}$/.test(d)) {
    throw new HttpError(
      "Enter a valid Nigerian phone number or leave it empty",
    );
  }
  return `+234${d}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  let orderId: string | null = null;

  try {
    const me = await requireStaff(req);
    const b = await req.json();

    const orderType = String(b.order_type ?? "");
    const method = String(b.method ?? "");
    if (!ORDER_TYPES.includes(orderType))
      throw new HttpError("Choose an order type");
    if (!METHODS.includes(method))
      throw new HttpError("Choose a payment method");

    const name = String(b.name ?? "").trim() || "Walk-in customer";
    const phone = normalizePhone(b.phone);
    const address = String(b.address ?? "").trim();
    const reference = String(b.reference ?? "")
      .trim()
      .slice(0, 40);
    const table = String(b.table ?? "").trim();
    if (orderType === "delivery" && address.length < 5) {
      throw new HttpError("Enter the delivery address");
    }

    if (
      !Array.isArray(b.items) ||
      b.items.length === 0 ||
      b.items.length > 60
    ) {
      throw new HttpError("The order is empty");
    }
    const qty = new Map<string, number>();
    for (const it of b.items) {
      const id = String(it?.id ?? "");
      const q = Number(it?.quantity);
      if (!id || !Number.isInteger(q) || q < 1 || q > 100)
        throw new HttpError("Invalid item");
      qty.set(id, (qty.get(id) ?? 0) + q);
    }

    const { data: rest } = await admin
      .from("restaurants")
      .select("id,delivery_fee,takeaway_fee")
      .eq("id", me.restaurant_id)
      .single();
    if (!rest) throw new HttpError("Restaurant not found", 404);

    const ids = [...qty.keys()];
    const { data: menu } = await admin
      .from("menu_items")
      .select("id,name,price,availability")
      .eq("restaurant_id", me.restaurant_id)
      .in("id", ids);
    if (!menu || menu.length !== ids.length) {
      throw new HttpError("Some items are no longer on the menu");
    }

    let subtotal = 0;
    const lines = menu.map((m) => {
      if (m.availability === "hidden" || isSoldOut(m.availability)) {
        throw new HttpError(`${m.name} is sold out`);
      }
      const quantity = qty.get(m.id)!;
      subtotal += Number(m.price) * quantity;
      return {
        menu_item_id: m.id,
        item_name: m.name,
        item_price: Number(m.price),
        quantity,
      };
    });

    const deliveryFee =
      orderType === "delivery" ? Number(rest.delivery_fee ?? 0) : 0;
    const takeawayFee =
      orderType === "takeaway" ? Number(rest.takeaway_fee ?? 0) : 0;
    const total = subtotal + deliveryFee + takeawayFee;

    let customerId: string | null = null;
    if (phone) {
      const { data: existing } = await admin
        .from("customers")
        .select("id")
        .eq("restaurant_id", me.restaurant_id)
        .eq("phone", phone)
        .limit(1)
        .maybeSingle();
      if (existing) {
        customerId = existing.id;
      } else {
        const { data: created } = await admin
          .from("customers")
          .insert({ restaurant_id: me.restaurant_id, name, phone })
          .select("id")
          .single();
        customerId = created?.id ?? null;
      }
    }

    let tableId: string | null = null;
    if (orderType === "dine_in" && table) {
      const { data: t } = await admin
        .from("tables")
        .select("id")
        .eq("restaurant_id", me.restaurant_id)
        .eq("table_number", table)
        .maybeSingle();
      tableId = t?.id ?? null;
    }

    const paid = method !== "pay_later";
    const now = new Date().toISOString();

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        restaurant_id: me.restaurant_id,
        table_id: tableId,
        customer_id: customerId,
        order_type: orderType,
        status: paid ? "confirmed" : "pending",
        payment_status: paid ? "success" : "pending",
        source: "counter",
        payment_method: paid ? method : null,
        payment_reference: reference || null,
        created_by: me.id,
        subtotal,
        delivery_fee: deliveryFee,
        takeaway_fee: takeawayFee,
        discount: 0,
        total,
        delivery_name: name,
        delivery_phone: phone,
        delivery_address: address || null,
        paid_at: paid ? now : null,
        confirmed_at: paid ? now : null,
      })
      .select("id,order_number,receipt_token")
      .single();
    if (orderErr || !order) {
      throw new HttpError(
        orderErr?.message || "Could not create the order",
        500,
      );
    }
    orderId = order.id;

    const { error: itemsErr } = await admin
      .from("order_items")
      .insert(
        lines.map((ln) => ({
          ...ln,
          restaurant_id: me.restaurant_id,
          order_id: order.id,
        })),
      );
    if (itemsErr) throw new HttpError(itemsErr.message, 500);

    if (paid) {
      const { error: payErr } = await admin.from("payments").insert({
        restaurant_id: me.restaurant_id,
        order_id: order.id,
        provider: method,
        reference: `${method.toUpperCase()}-${order.order_number ?? order.id.slice(0, 6)}-${Date.now()}`,
        amount: total,
        currency: "NGN",
        status: "success",
        paid_at: now,
        metadata: { note: reference || null, created_by: me.id },
      });
      if (payErr) throw new HttpError(payErr.message, 500);
    }

    return reply({
      ok: true,
      order_id: order.id,
      order_number: order.order_number,
      receipt_token: order.receipt_token,
      total,
      paid,
    });
  } catch (err) {
    if (orderId) {
      await admin.from("order_items").delete().eq("order_id", orderId);
      await admin.from("orders").delete().eq("id", orderId);
    }
    if (err instanceof HttpError)
      return reply({ error: err.message }, err.status);
    console.error(err);
    return reply({ error: "Something went wrong. Please try again." }, 500);
  }
});
