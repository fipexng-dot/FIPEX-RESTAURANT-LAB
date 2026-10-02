export const ROLE_LABELS: Record<string, string> = {
  restaurant_owner: 'Owner',
  manager: 'Manager',
  cashier: 'Cashier',
  kitchen: 'Kitchen staff',
}

const ACCESS: Record<string, string[] | 'all'> = {
  restaurant_owner: 'all',
  manager: ['dashboard', 'orders', 'menu', 'tables', 'customers', 'payments', 'kitchen', 'reports', 'notifications'],
  cashier: ['orders', 'payments', 'customers', 'notifications'],
  kitchen: ['kitchen', 'orders', 'notifications'],
}

const ORDER = ['dashboard', 'orders', 'kitchen', 'payments', 'customers', 'menu', 'tables', 'reports', 'notifications', 'staff', 'settings']

export function sectionOf(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  return parts[1] || 'dashboard'
}

export function canAccess(role: string | undefined, section: string) {
  if (!role) return false
  const rule = ACCESS[role]
  if (rule === 'all') return true
  if (rule) return rule.includes(section)
  return /owner|admin/.test(role)
}

export function firstAllowed(role: string | undefined) {
  const s = ORDER.find((x) => canAccess(role, x))
  if (!s) return ''
  return s === 'dashboard' ? '/dashboard' : `/dashboard/${s}`
}
