import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          };

          Deno.serve(async (req) => {
            if (req.method === "OPTIONS") {
                return new Response("ok", { headers: corsHeaders });
                  }

                    try {
                        const { order_id, email, callback_url } = await req.json();

                            if (!order_id || !email) {
                                  return new Response(
                                          JSON.stringify({ error: "order_id and email are required" }),
                                                  { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                                                        );
                                                            }

                                                                const { data: order, error: orderErr } = await supabase
                                                                      .from("orders")
                                                                            .select("id, total, payment_status")
                                                                                  .eq("id", order_id)
                                                                                        .single();

                                                                                            if (orderErr || !order) {
                                                                                                  return new Response(JSON.stringify({ error: "Order not found" }), {
                                                                                                          status: 404,
                                                                                                                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                                                                                                                        });
                                                                                                                            }

                                                                                                                                if (order.payment_status === "success") {
                                                                                                                                      return new Response(JSON.stringify({ error: "Order already paid" }), {
                                                                                                                                              status: 400,
                                                                                                                                                      headers: { ...corsHeaders, "Content-Type": "application/json" },
                                                                                                                                                            });
                                                                                                                                                                }

                                                                                                                                                                    const amountInKobo = Math.round(order.total * 100);

                                                                                                                                                                        const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
                                                                                                                                                                              method: "POST",
                                                                                                                                                                                    headers: {
                                                                                                                                                                                            Authorization: `Bearer ${PAYSTACK_SECRET}`,
                                                                                                                                                                                                    "Content-Type": "application/json",
                                                                                                                                                                                                          },
                                                                                                                                                                                                                body: JSON.stringify({
                                                                                                                                                                                                                        email,
                                                                                                                                                                                                                                amount: amountInKobo,
                                                                                                                                                                                                                                        metadata: { order_id: order.id },
                                                                                                                                                                                                                                                callback_url,
                                                                                                                                                                                                                                                      }),
                                                                                                                                                                                                                                                          });

                                                                                                                                                                                                                                                              const paystackData = await paystackRes.json();

                                                                                                                                                                                                                                                                  if (!paystackData.status) {
                                                                                                                                                                                                                                                                        return new Response(JSON.stringify({ error: paystackData.message }), {
                                                                                                                                                                                                                                                                                status: 400,
                                                                                                                                                                                                                                                                                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                                                                                                                                                                                                                                                                                              });
                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                      await supabase
                                                                                                                                                                                                                                                                                                            .from("orders")
                                                                                                                                                                                                                                                                                                                  .update({ payment_status: "pending" })
                                                                                                                                                                                                                                                                                                                        .eq("id", order.id);

                                                                                                                                                                                                                                                                                                                            return new Response(
                                                                                                                                                                                                                                                                                                                                  JSON.stringify({
                                                                                                                                                                                                                                                                                                                                          authorization_url: paystackData.data.authorization_url,
                                                                                                                                                                                                                                                                                                                                                  reference: paystackData.data.reference,
                                                                                                                                                                                                                                                                                                                                                        }),
                                                                                                                                                                                                                                                                                                                                                              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                                                                                                                                                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                                                                                                                                                    } catch (err) {
                                                                                                                                                                                                                                                                                                                                                                        return new Response(JSON.stringify({ error: String(err) }), {
                                                                                                                                                                                                                                                                                                                                                                              status: 500,
                                                                                                                                                                                                                                                                                                                                                                                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                                                                                                                                                                                                                                                                                                                                                                                        });
                                                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                                                                                                                                                          