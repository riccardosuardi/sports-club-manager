import { forwardRef } from 'react'
import { Search } from 'lucide-react'

const SearchInput = forwardRef(function SearchInput({ value, onChange, placeholder = 'Cerca...' }, ref) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
      />
    </div>
  )
})

export default SearchInput
