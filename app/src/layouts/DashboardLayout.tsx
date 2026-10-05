import { useLocation } from 'react-router-dom'
import { canAccess, sectionOf } from '../lib/permissions'
import NoAccess from '../components/NoAccess'
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";

import {
  BACKGROUND_PATTERNS,
  type BackgroundKey,
} from "../lib/backgroundPatterns";
import { useOrderAlerts } from '../hooks/useOrderAlerts'
import { OrderAlerts } from '../components/OrderAlerts'

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠", end: true },
  { to: "/dashboard/orders", label: "Orders", icon: "🧾" },
  { to: '/dashboard/counter', label: 'Counter Order', icon: '🛎️' },
  { to: "/dashboard/menu", label: "Menu", icon: "🍽️" },
  { to: "/dashboard/tables", label: "Tables & QR", icon: "🪑" },
  { to: "/dashboard/customers", label: "Customers", icon: "👥" },
  { to: "/dashboard/payments", label: "Payments", icon: "💳" },
  { to: "/dashboard/kitchen", label: "Kitchen", icon: "👨‍🍳" },
  { to: "/dashboard/reports", label: "Reports", icon: "📊" },
  { to: "/dashboard/staff", label: "Staff", icon: "🧑‍💼" },
  { to: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
  { to: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

function useIsMobile() {
  const query = "(max-width: 768px)";
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export default function DashboardLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation()
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const alerts = useOrderAlerts(profile?.restaurant_id)
  const [bgKey, setBgKey] = useState<BackgroundKey>("terracotta");

  useEffect(() => {
    async function loadTheme() {
      if (!profile?.restaurant_id) return;
      const { data } = await supabase
        .from("restaurants")
        .select("dashboard_background")
        .eq("id", profile.restaurant_id)
        .single();

      if (
        data?.dashboard_background &&
        data.dashboard_background in BACKGROUND_PATTERNS
      ) {
        setBgKey(data.dashboard_background as BackgroundKey);
      }
    }
    loadTheme();
  }, [profile?.restaurant_id]);

  const theme = BACKGROUND_PATTERNS[bgKey] ?? BACKGROUND_PATTERNS.terracotta;

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const sidebarStyle: React.CSSProperties = {
    width: 220,
    minWidth: 220,
    background: theme.sidebar,
    color: "#fff",
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    ...(isMobile
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1000,
          overflowY: "auto",
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.2s ease",
        }
      : {}),
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.pageBg,
        fontFamily: "system-ui, sans-serif",
      }}
    >
    <OrderAlerts
      alerts={alerts.alerts}
        soundOn={alerts.soundOn}
          enableSound={alerts.enableSound}
            dismiss={alerts.dismiss}
              onOpen={() => navigate('/dashboard/orders')}
              />
      {isMobile && menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 999,
          }}
        />
      )}

      <aside style={sidebarStyle}>
        <div
          style={{
            padding: "0 8px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 22 }}>🍲</div>
          <h3
            style={{
              margin: "6px 0 0",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            Restaurant SaaS
          </h3>
        </div>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}
        >
          {navItems.filter((item) => canAccess(profile?.role, sectionOf(item.to))).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
                background: isActive ? theme.accent : "transparent",
                transition: "background 0.15s",
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
              {(item.to === '/dashboard/orders' || item.to === '/dashboard/kitchen') && alerts.unseen > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', borderRadius: 12, fontSize: 12, fontWeight: 700, padding: '1px 8px' }}>
                      {alerts.unseen}
                        </span>
                        )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "10px 12px" : "14px 24px",
            background: "#fff",
            borderBottom: "1px solid #eee0d5",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            {isMobile && (
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                style={{
                  border: "1px solid #eee0d5",
                  background: "transparent",
                  color: theme.accent,
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: 22,
                  cursor: "pointer",
                }}
              >
                ☰
              </button>
            )}
            <span
              style={{
                width: 32,
                height: 32,
                minWidth: 32,
                borderRadius: "50%",
                background: theme.accentLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              👤
            </span>
            <span
              style={{
                fontSize: 14,
                color: "#2b1b12",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profile?.full_name || "User"}{" "}
              {!isMobile && (
                <span style={{ color: "#7c6a5e" }}>
                  ({profile?.role || "owner"})
                </span>
              )}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              border: "1px solid #eee0d5",
              background: "transparent",
              color: theme.accent,
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </header>

        <main style={{ flex: 1, padding: 0, minWidth: 0 }}>
          {canAccess(profile?.role, sectionOf(pathname)) ? <Outlet key={alerts.refreshKey} /> : <NoAccess role={profile?.role} />}
        </main>
      </div>
    </div>
  );
}
