export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      {Icon && <Icon size={48} className="mb-4 text-gray-400" />}
      <h3 className="mb-1 text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  )
}
