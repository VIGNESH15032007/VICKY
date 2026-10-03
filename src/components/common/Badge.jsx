import React from 'react';

export default function Badge({ status, text, size = 'sm', className = '' }) {
  const getStyle = () => {
    switch (status) {
      case 'ON_TIME':
      case 'NOMINAL':
      case 'ON_SCHEDULE':
      case 'ACTIVE':
        return {
          bg: 'bg-tertiary-container/20 text-tertiary border-tertiary/30',
          dot: 'bg-tertiary',
          defaultText: 'On Time'
        };
      case 'DELAYED':
      case 'SLOW_TRAFFIC':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          defaultText: 'Delayed'
        };
      case 'DISRUPTED':
      case 'DETOUR':
      case 'EMERGENCY':
        return {
          bg: 'bg-error-container/30 text-error border-error/40',
          dot: 'bg-error',
          defaultText: 'Detour'
        };
      case 'MAINTENANCE':
      case 'STANDBY':
        return {
          bg: 'bg-surface-container-highest text-on-surface-variant border-outline/30',
          dot: 'bg-outline',
          defaultText: 'Maintenance'
        };
      default:
        return {
          bg: 'bg-primary-container/20 text-primary border-primary/30',
          dot: 'bg-primary',
          defaultText: status || 'Live'
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-label-${size} text-label-${size} font-semibold ${style.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === 'ON_TIME' || status === 'ON_SCHEDULE' ? 'animate-pulse' : ''}`} />
      <span>{text || style.defaultText}</span>
    </span>
  );
}
