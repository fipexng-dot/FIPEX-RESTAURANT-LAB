import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabaseClient";
import { ReceiptLink } from "./ReceiptLink";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  order_type: string;
  total: number;
  created_at: string;
  table_id: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
};

type ItemRow = {
  order_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
};

const PAGE_SIZE = 25;
const STATUS_OPTIONS = [
  "all",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];
const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#999",
  confirmed: "#b7791f",
  preparing: "#2b6cb0",
  ready: "#2f855a",
  completed: "#4a5568",
  cancelled: "#c53030",
};

function rangeStart(key: string): string | null {
  const d = new Date();
  if (key === "today") {
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (key === "7d") {
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }
  if (key === "30d") {
    d.setDate(d.getDate() - 30);
    return d.toISOString();
  }
  return null;
}

export default function Orders() {
  const { profile } = useAuth();
  const restaurantId = profile?.restaurant_id;

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<Record<string, ItemRow[]>>({});
  const [tables, setTables] = useState<Record<string, string>>({});

  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("7d");
  const [search, setSearch] = useState("");
  const [includeUnpaid, setIncludeUnpaid] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(
    async (pageToLoad: number) => {
      if (!restaurantId) return;
      setLoading(true);
      setError("");

      let query = supabase
        .from("orders")
        .select(
          "id, order_number, status, payment_status, order_type, total, created_at, table_id, delivery_name, delivery_phone",
        )
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .range(pageToLoad * PAGE_SIZE, pageToLoad * PAGE_SIZE + PAGE_SIZE);

      if (!includeUnpaid) query = query.eq("payment_status", "success");
      if (status !== "all") query = query.eq("status", status);
      const start = rangeStart(range);
      if (start) query = query.gte("created_at", start);
      if (search.trim())
        query = query.ilike("order_number", `%${search.trim()}%`);

      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const rows = (data || []) as OrderRow[];
      setHasMore(rows.length > PAGE_SIZE);
      const pageRows = rows.slice(0, PAGE_SIZE);

      setOrders((prev) =>
        pageToLoad === 0 ? pageRows : [...prev, ...pageRows],
      );

      const ids = pageRows.map((o) => o.id);
      if (ids.length > 0) {
        const { data: itemRows } = await supabase
          .from("order_items")
          .select("order_id, item_name, item_price, quantity")
          .in("order_id", ids);

        const grouped: Record<string, ItemRow[]> = {};
        ((itemRows || []) as ItemRow[]).forEach((it) => {
          if (!grouped[it.order_id]) grouped[it.order_id] = [];
          grouped[it.order_id].push(it);
        });
        setItems((prev) => ({ ...prev, ...grouped }));
      }

      const tableIds = pageRows
        .map((o) => o.table_id)
        .filter(Boolean) as string[];
      if (tableIds.length > 0) {
        const { data: tableRows } = await supabase
          .from("tables")
          .select("id, table_number")
          .in("id", tableIds);

        const map: Record<string, string> = {};
        (tableRows || []).forEach((t: { id: string; table_number: string }) => {
          map[t.id] = t.table_number;
        });
        setTables((prev) => ({ ...prev, ...map }));
      }

      setLoading(false);
    },
    [restaurantId, status, range, search, includeUnpaid],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      load(0);
    }, 300);
    return () => clearTimeout(t);
  }, [load]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(next);
  }

  function typeLabel(o: OrderRow) {
    if (o.order_type === "dine_in") {
      const num = o.table_id ? tables[o.table_id] : null;
      return num ? `Dine-in · Table ${num}` : "Dine-in · no table";
    }
    return o.order_type.replace("_", " ");
  }

  if (!restaurantId) {
    return <div style={{ padding: 24 }}>Loading your restaurant...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Orders</h2>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}
      >
        <input
          type="text"
          placeholder="Search order number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, flex: "1 1 160px" }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: 8 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          style={{ padding: 8 }}
        >
          {RANGE_OPTIONS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={includeUnpaid}
            onChange={(e) => setIncludeUnpaid(e.target.checked)}
          />
          Include unpaid
        </label>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {orders.length === 0 && !loading && (
        <p>No orders found for these filters.</p>
      )}

      {orders.map((o) => {
        const isOpen = openId === o.id;
        return (
          <div
            key={o.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 10,
              padding: 12,
            }}
          >
            <div
              onClick={() => setOpenId(isOpen ? null : o.id)}
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <span>#{o.order_number}</span>
                <span>₦{Number(o.total).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                {new Date(o.created_at).toLocaleString()} · {typeLabel(o)}
              </div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                <span
                  style={{
                    background: STATUS_COLORS[o.status] || "#999",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: 10,
                    textTransform: "uppercase",
                  }}
                >
                  {o.status}
                </span>{" "}
                <span
                  style={{
                    color:
                      o.payment_status === "success" ? "#2f855a" : "#c53030",
                  }}
                >
                  {o.payment_status === "success"
                    ? "PAID ✓"
                    : `PAYMENT ${o.payment_status}`}
                </span>
              </div>
            </div>

            {isOpen && (
              <div
                style={{
                  marginTop: 10,
                  borderTop: "1px solid #eee",
                  paddingTop: 10,
                }}
              >
                {(items[o.id] || []).map((it, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>
                      {it.item_name} × {it.quantity}
                    </span>
                    <span>
                      ₦{(it.item_price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <ReceiptLink orderId={o.id} paid={o.payment_status === "success"} phone={o.delivery_phone} />
{(o.delivery_name || o.delivery_phone) && (
                  <p style={{ fontSize: 13, marginTop: 8 }}>
                    Customer: {o.delivery_name}{" "}
                    {o.delivery_phone && `· ${o.delivery_phone}`}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {loading && <p>Loading...</p>}

      {hasMore && !loading && (
        <button
          onClick={loadMore}
          style={{ padding: "10px 20px", width: "100%" }}
        >
          Load more
        </button>
      )}
    </div>
  );
}
