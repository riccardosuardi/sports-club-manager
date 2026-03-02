import { format, parseISO, differenceInYears, isAfter } from 'date-fns'
import { it } from 'date-fns/locale'

export function formatDate(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: it })
}

export function formatDateTime(date) {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: it })
}

export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null
  const d = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth
  return differenceInYears(new Date(), d)
}

export function isCertificateExpired(expiryDate) {
  if (!expiryDate) return true
  const d = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate
  return !isAfter(d, new Date())
}

export function isCertificateExpiringSoon(expiryDate, daysThreshold = 30) {
  if (!expiryDate) return false
  const d = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate
  const threshold = new Date()
  threshold.setDate(threshold.getDate() + daysThreshold)
  return isAfter(d, new Date()) && !isAfter(d, threshold)
}

export function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

export function getFullName(member) {
  return `${member.first_name} ${member.last_name}`
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const STATUS_COLORS = {
  attivo: 'bg-green-100 text-green-800',
  sospeso: 'bg-yellow-100 text-yellow-800',
  scaduto: 'bg-red-100 text-red-800',
  cancellato: 'bg-gray-100 text-gray-800',
  nuovo: 'bg-blue-100 text-blue-800',
  contattato: 'bg-purple-100 text-purple-800',
  interessato: 'bg-orange-100 text-orange-800',
  convertito: 'bg-green-100 text-green-800',
  perso: 'bg-red-100 text-red-800',
  richiesto: 'bg-blue-100 text-blue-800',
  ordinato: 'bg-yellow-100 text-yellow-800',
  arrivato: 'bg-green-100 text-green-800',
  consegnato: 'bg-gray-100 text-gray-800',
  annullato: 'bg-red-100 text-red-800',
  completato: 'bg-gray-100 text-gray-800',
  ritirato: 'bg-red-100 text-red-800',
}
