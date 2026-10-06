import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY")!;

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
const isSoldOut = (availability: string) => /sold|out|unavail/i.test(availability || "");

type Body = {
  restaurant_slug?: string;
  items?: { id: string; quantity: number }[];
  order_type?: string;
  table?: string | null;
  name?: string;
  phone?: string;
  address?: string | null;
  email?: string;
  callback_url?: string;
};

function cleanPhone(raw: unknown): string {
  const phone = String(raw ?? "").replace(/[\s()-]/g, "");
  if (!/^\+\d{8,15}$/.test(phone)) {
    throw new HttpError("Please enter a valid phone number");
  }
  if (phone.startsWith("+234") && !/^\+234[789][01]\d{8}$/.test(phone)) {
    throw new HttpError("Please enter a valid Nigerian mobile number");
  }
  return phone;
}

function validate(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError("Invalid request body");
  }

  const body = value as Body;
  const slug = String(body.restaurant_slug ?? "").trim();
  if (!slug) throw new HttpError("Restaurant is missing");

  const orderType = String(body.order_type);
  if (!ORDER_TYPES.includes(orderType)) throw new HttpError("Invalid order type");

  const name = String(body.name ?? "").trim();
  if (name.length < 2) throw new HttpError("Please enter your name");

  const email = String(body.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError("Please enter a valid email address");
  }

  const phone = cleanPhone(body.phone);
  const address = String(body.address ?? "").trim();
  if (orderType === "delivery" && address.length < 5) {
    throw new HttpError("Please enter a delivery address");
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    throw new HttpError("Your cart is empty");
  }

  const quantities = new Map<string, number>();
  for (const item of body.items) {
    const id = String(item?.id ?? "");
    const quantity = Number(item?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw new HttpError("Invalid cart item");
    }
    const totalQuantity = (quantities.get(id) ?? 0) + quantity;
    if (totalQuantity > 50) throw new HttpError("Invalid cart item quantity");
    quantities.set(id, totalQuantity);
  }

  let callback: URL;
  try {
    callback = new URL(String(body.callback_url));
  } catch {
    throw new HttpError("Invalid callback url");
  }
  if (!/^https?:$/.test(callback.protocol)) {
    throw new HttpError("Invalid callback url");
  }

  return {
    slug,
    orderType,
    name,
    email,
    phone,
    address,
    quantities,
    callbackUrl: callback.toString(),
    table: body.table ? String(body.table) : null,
  };
}

function lagosNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    day: get("weekday").slice(0, 3).toLowerCase(),
    mins: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}
function toMins(s: string) {
  const [h, m] = String(s).split(":").map(Number);
  return h * 60 + (m || 0);
}
// deno-lint-ignore no-explicit-any
function assertOpen(r: any) {
  if (!r.use_opening_hours || !r.opening_hours) return;
  const { day, mins } = lagosNow();
  const d = r.opening_hours[day];
  if (!d || d.closed) throw new HttpError("The restaurant is closed today", 400);
  const o = toMins(d.open);
  const c = toMins(d.close);
  const isOpen = o <= c ? mins >= o && mins < c : mins >= o || mins < c;
  if (!isOpen) throw new HttpError(`The restaurant is closed now. Open ${d.open} - ${d.close}`, 400);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return reply({ error: "Method not allowed" }, 405);
  }

  let orderId: string | null = null;

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new HttpError("Invalid JSON request body");
    }
    const values = validate(body);

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id,status,delivery_fee,takeaway_fee,vat_percent,service_charge_percent,min_delivery_order,use_opening_hours,opening_hours")
      .eq("slug", values.slug)
      .maybeSingle();
    if (!restaurant) throw new HttpError("Restaurant not found", 404);
    assertOpen(restaurant);
    if (restaurant.status === "closed") {
      throw new HttpError("Restaurant is currently closed");
    }

    // Prices come from the database, never from the browser.
    const itemIds = [...values.quantities.keys()];
    const { data: menu } = await supabase
      .from("menu_items")
      .select("id,name,price,availability")
      .eq("restaurant_id", restaurant.id)
      .in("id", itemIds);
    if (!menu || menu.length !== itemIds.length) {
      throw new HttpError("Some items are no longer on the menu");
    }

    let subtotal = 0;
    const lines = menu.map((menuItem) => {
      if (menuItem.availability === "hidden" || isSoldOut(menuItem.availability)) {
        throw new HttpError(`${menuItem.name} is sold out`);
      }
      const quantity = values.quantities.get(menuItem.id)!;
      const itemPrice = Number(menuItem.price);
      subtotal += itemPrice * quantity;
      return {
        menu_item_id: menuItem.id,
        item_name: menuItem.name,
        item_price: itemPrice,
        quantity,
      };
    });

    const deliveryFee = values.orderType === "delivery"
      ? Number(restaurant.delivery_fee ?? 0)
      : 0;
    const takeawayFee = values.orderType === "takeaway"
      ? Number(restaurant.takeaway_fee ?? 0)
      : 0;

    if (values.orderType === "delivery" && subtotal < Number(restaurant.min_delivery_order ?? 0)) {
      throw new HttpError(`Minimum delivery order is ₦${Number(restaurant.min_delivery_order).toLocaleString()}`, 400);
    }
    let discount = 0;
    const { data: loyaltyData } = await supabase.rpc("get_loyalty_status", {
      p_restaurant_id: restaurant.id,
      p_phone: values.phone,
    });
    const loyalty = Array.isArray(loyaltyData) ? loyaltyData[0] : null;
    if (loyalty?.qualifies) {
      if (loyalty.reward_type === "free_delivery") {
        discount = deliveryFee;
      } else if (loyalty.reward_type === "free_food") {
        discount = Math.min(Number(loyalty.reward_value ?? 0), subtotal);
      }
    }

    const taxable = Math.max(0, subtotal - discount);
    const serviceCharge = Math.round((taxable * Number(restaurant.service_charge_percent ?? 0)) / 100);
    const vat = Math.round(((taxable + serviceCharge) * Number(restaurant.vat_percent ?? 0)) / 100);
    const total = Math.max(0, taxable + serviceCharge + vat + deliveryFee + takeawayFee);
    if (total <= 0) throw new HttpError("Order total must be greater than zero");

    let customerId: string | null = null;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("restaurant_id", restaurant.id)
      .eq("phone", values.phone)
      .limit(1)
      .maybeSingle();
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: createdCustomer } = await supabase
        .from("customers")
        .insert({
          restaurant_id: restaurant.id,
          name: values.name,
          phone: values.phone,
          email: values.email,
        })
        .select("id")
        .single();
      customerId = createdCustomer?.id ?? null;
    }

    let tableId: string | null = null;
    if (values.orderType === "dine_in" && values.table) {
      const { data: table } = await supabase
        .from("tables")
        .select("id")
        .eq("restaurant_id", restaurant.id)
        .eq("table_number", values.table)
        .maybeSingle();
      tableId = table?.id ?? null;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        table_id: tableId,
        customer_id: customerId,
        order_type: values.orderType,
        status: "pending",
        payment_status: "pending",
        source: "qr",
        subtotal,
        delivery_fee: deliveryFee,
        vat_amount: vat,
        service_charge_amount: serviceCharge,
        takeaway_fee: takeawayFee,
        discount,
        total,
        loyalty_reward_applied: discount > 0,
        delivery_name: values.name,
        delivery_phone: values.phone,
        delivery_address: values.address || null,
      })
      .select("id")
      .single();
    if (orderError || !order) {
      throw new HttpError(orderError?.message || "Could not create order", 500);
    }
    orderId = order.id;

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        lines.map((line) => ({
          ...line,
          restaurant_id: restaurant.id,
          order_id: order.id,
        })),
      );
    if (itemsError) throw new HttpError(itemsError.message, 500);

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          amount: Math.round(total * 100),
          metadata: { order_id: order.id },
          callback_url: values.callbackUrl,
        }),
      },
    );
    const paystack = await paystackResponse.json();
    if (!paystackResponse.ok || !paystack.status || !paystack.data?.authorization_url) {
      throw new HttpError(paystack.message || "Could not start payment", 502);
    }

    return reply({
      authorization_url: paystack.data.authorization_url,
      reference: paystack.data.reference,
      order_id: order.id,
    });
  } catch (error) {
    if (orderId) {
      await supabase.from("order_items").delete().eq("order_id", orderId);
      await supabase.from("orders").delete().eq("id", orderId);
    }
    if (error instanceof HttpError) return reply({ error: error.message }, error.status);
    console.error(error);
    return reply({ error: "Something went wrong. Please try again." }, 500);
  }
});
