import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { COLORS, naira, short } from './reportParts'
import type { Report } from './reportData'

const axis = { fontSize: 12, fill: '#6b6b6b' }

export function RevenueChart({ data }: { data: Report['trend'] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
        <XAxis dataKey="label" tick={axis} interval="preserveStartEnd" minTickGap={26} />
        <YAxis tick={axis} width={48} tickFormatter={(v) => short(Number(v))} />
        <Tooltip formatter={(v) => naira(Number(v))} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#ea580c"
          strokeWidth={2.5}
          fill="url(#revFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function HoursChart({ data }: { data: Report['hours'] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
        <XAxis dataKey="label" tick={axis} interval={2} />
        <YAxis tick={axis} width={30} allowDecimals={false} />
        <Tooltip formatter={(v) => `${v} orders`} />
        <Bar dataKey="orders" name="Orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TypeDonut({ data }: { data: Report['types'] }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return <p style={{ color: '#6b6b6b', margin: 0 }}>No orders in this period.</p>
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v} orders`} />
        </PieChart>
      </ResponsiveContainer>

      {data.map((d, i) => (
        <div
          key={d.name}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '3px 0' }}
        >
          <span
            style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }}
          />
          <span style={{ flex: 1 }}>{d.name}</span>
          <span>
            {d.value} · {naira(d.revenue)}
          </span>
        </div>
      ))}
    </div>
  )
}
