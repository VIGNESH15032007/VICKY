import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function getStatusColor(status) {
  switch (status) {
    case 'ON_TIME':
    case 'NOMINAL':
    case 'ACTIVE':
    case 'IN_SERVICE':
      return {
        bg: 'bg-tertiary-container/30',
        text: 'text-tertiary',
        border: 'border-tertiary/40',
        dot: 'bg-tertiary',
        label: 'On Time'
      }
    case 'DELAYED':
    case 'MODERATE':
    case 'SLOW_TRAFFIC':
      return {
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        dot: 'bg-amber-400',
        label: 'Delayed'
      }
    case 'DISRUPTED':
    case 'FULL':
    case 'EMERGENCY':
    case 'MAINTENANCE':
      return {
        bg: 'bg-error-container/30',
        text: 'text-error',
        border: 'border-error/40',
        dot: 'bg-error',
        label: 'Disrupted'
      }
    default:
      return {
        bg: 'bg-surface-container-high',
        text: 'text-on-surface-variant',
        border: 'border-outline-variant',
        dot: 'bg-outline',
        label: status
      }
  }
}
