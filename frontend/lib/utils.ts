import { LogEntry } from '@/types/log';

export const parseLogLevel = (level: string): LogEntry['level'] => {
  const normalized = level.toUpperCase();
  if (['INFO', 'WARN', 'ERROR', 'DEBUG'].includes(normalized)) {
    return normalized as LogEntry['level'];
  }
  return 'INFO';
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getLevelColor = (level: LogEntry['level']): string => {
  const colors = {
    ERROR: 'red',
    WARN: 'yellow',
    INFO: 'blue',
    DEBUG: 'gray'
  };
  return colors[level] || 'blue';
};