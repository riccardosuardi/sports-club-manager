import { STATUS_COLORS } from '../../lib/utils'

export default function Badge({ status, children }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {children || status}
    </span>
  )
}
