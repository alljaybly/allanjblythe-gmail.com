import React from 'react';
import { BaselineStatus } from '../types';
import Tooltip from './Tooltip';

interface FeatureBadgeProps {
  status: BaselineStatus;
}

const statusStyles: { [key in BaselineStatus]: { text: string; bg: string; dot: string; tooltip: string } } = {
  [BaselineStatus.Widely]: {
    text: 'text-green-800 dark:text-green-300',
    bg: 'bg-green-100 dark:bg-green-900/50',
    dot: 'bg-green-500',
    tooltip: 'Supported by all major browsers. Safe for production use.',
  },
  [BaselineStatus.Newly]: {
    text: 'text-blue-800 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    dot: 'bg-blue-500',
    tooltip: 'Recently available in all major browsers. Check specific versions.',
  },
  [BaselineStatus.Limited]: {
    text: 'text-orange-800 dark:text-orange-300',
    bg: 'bg-orange-100 dark:bg-orange-900/50',
    dot: 'bg-orange-500',
    tooltip: 'Limited support. Not available in one or more major browsers.',
  },
  [BaselineStatus.Unknown]: {
    text: 'text-gray-800 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-900/50',
    dot: 'bg-gray-500',
    tooltip: 'Status is unknown or not tracked by Baseline.',
  },
};

const FeatureBadge: React.FC<FeatureBadgeProps> = ({ status }) => {
  const styles = statusStyles[status];

  return (
    <Tooltip content={styles.tooltip}>
      <div
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
      >
        <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${styles.dot}`} fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
        {status}
      </div>
    </Tooltip>
  );
};

export default FeatureBadge;
