import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY")!;

    async function verifySignature(rawBody: string, signature: string | null): Promise<boolean> {
      if (!signature) return false;
        const key = await crypto.subtle.importKey(
            "raw",
                new TextEncoder().encode(PAYSTACK_SECRET),
                    { name: "HMAC", hash: "SHA-512" },
                        false,
                            ["sign"]
                              );
                                const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
                                  const hashArray = Array.from(new Uint8Array(sig));
                                    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
                                      return hashHex === signature;
                                      }

                                      Deno.serve(async (req) => {
                                        const signature = req.headers.get("x-paystack-signature");
                                          const rawBody = await req.text();

                                            const valid = await verifySignature(rawBody, signature);
                                              if (!valid) {
                                                  return new Response("Invalid signature", { status: 401 });
                                                    }

                                                      const event = JSON.parse(rawBody);

                                                        if (event.event === "charge.success") {
                                                            const { reference, amount, currency, gateway_response, metadata } = event.data;
                                                                const orderId = metadata?.order_id;

                                                                    if (!orderId) {
                                                                          return new Response("Missing order_id in metadata", { status: 400 });
                                                                              }

                                                                                  const { data: order, error: orderErr } = await supabase
                                                                                        .from("orders")
                                                                                              .select("id, restaurant_id, total, payment_status")
                                                                                                    .eq("id", orderId)
                                                                                                          .single();

                                                                                                              if (orderErr || !order) {
                                                                                                                    console.error("Order lookup failed:", orderErr);
                                                                                                                          return new Response("Order not found", { status: 404 });
                                                                                                                              }

                                                                                                                                  if (order.payment_status === "success") {
                                                                                                                                        return new Response("Already processed", { status: 200 });
                                                                                                                                            }

                                                                                                                                                const amountMatches = Math.round(order.total * 100) === amount;

                                                                                                                                                    if (!amountMatches) {
                                                                                                                                                          const { error: mismatchErr } = await supabase.from("payments").insert({
                                                                                                                                                                  restaurant_id: order.restaurant_id,
                                                                                                                                                                          order_id: orderId,
                                                                                                                                                                                  provider: "paystack",
                                                                                                                                                                                          reference,
                                                                                                                                                                                                  amount: amount / 100,
                                                                                                                                                                                                          currency: currency || "NGN",
                                                                                                                                                                                                                  status: "mismatch",
                                                                                                                                                                                                                          gateway_response,
                                                                                                                                                                                                                                  metadata: event,
                                                                                                                                                                                                                                        });
                                                                                                                                                                                                                                              if (mismatchErr) console.error("Payments insert (mismatch) failed:", mismatchErr);
                                                                                                                                                                                                                                                    return new Response("Amount mismatch logged", { status: 200 });
                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                            const { error: paymentErr } = await supabase.from("payments").insert({
                                                                                                                                                                                                                                                                  restaurant_id: order.restaurant_id,
                                                                                                                                                                                                                                                                        order_id: orderId,
                                                                                                                                                                                                                                                                              provider: "paystack",
                                                                                                                                                                                                                                                                                    reference,
                                                                                                                                                                                                                                                                                          amount: amount / 100,
                                                                                                                                                                                                                                                                                                currency: currency || "NGN",
                                                                                                                                                                                                                                                                                                      status: "success",
                                                                                                                                                                                                                                                                                                            paid_at: new Date().toISOString(),
                                                                                                                                                                                                                                                                                                                  gateway_response,
                                                                                                                                                                                                                                                                                                                        metadata: event,
                                                                                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                                                                                                if (paymentErr) {
                                                                                                                                                                                                                                                                                                                                      console.error("Payments insert failed:", paymentErr);
                                                                                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                                                                                              const { error: updateErr } = await supabase
                                                                                                                                                                                                                                                                                                                                                    .from("orders")
                                                                                                                                                                                                                                                                                                                                                          .update({
                                                                                                                                                                                                                                                                                                                                                                  payment_status: "success",
                                                                                                                                                                                                                                                                                                                                                                          status: "confirmed",
                                                                                                                                                                                                                                                                                                                                                                                  paid_at: new Date().toISOString(),
                                                                                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                                                                                              .eq("id", orderId);

                                                                                                                                                                                                                                                                                                                                                                                                  if (updateErr) {
                                                                                                                                                                                                                                                                                                                                                                                                        console.error("Orders update failed:", updateErr);
                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                                                                                                                                                return new Response("OK", { status: 200 });
                                                                                                                                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                                                                                                                                