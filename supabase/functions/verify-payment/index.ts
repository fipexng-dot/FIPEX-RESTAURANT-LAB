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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      return new Response(JSON.stringify({ error: "reference is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ask Paystack directly — don't rely solely on the webhook having fired
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } },
    );
    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return new Response(
        JSON.stringify({ success: false, error: "Payment not successful" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { amount, currency, gateway_response, metadata } = paystackData.data;
    const orderId = metadata?.order_id;

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Missing order_id in metadata" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        "id, restaurant_id, order_number, order_type, status, payment_status, total",
      )
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only write if not already processed (webhook may have gotten there first — that's fine)
    if (order.payment_status !== "success") {
      const amountMatches = Math.round(order.total * 100) === amount;

      if (amountMatches) {
        await supabase.from("payments").insert({
          restaurant_id: order.restaurant_id,
          order_id: orderId,
          provider: "paystack",
          reference,
          amount: amount / 100,
          currency: currency || "NGN",
          status: "success",
          paid_at: new Date().toISOString(),
          gateway_response,
          metadata: paystackData,
        });

        await supabase
          .from("orders")
          .update({
            payment_status: "success",
            status: "confirmed",
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        order.payment_status = "success";
        order.status = "confirmed";
      }
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("item_name, item_price, quantity")
      .eq("order_id", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          order_number: order.order_number,
          order_type: order.order_type,
          status: order.status,
          payment_status: order.payment_status,
          total: order.total,
        },
        items: items || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
