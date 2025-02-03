import { LogFilter, LogEntry } from '@/types/log';

interface Props {
  filter: LogFilter;
  onChange: (filter: LogFilter) => void;
}

export const FilterPanel: React.FC<Props> = ({ filter, onChange }) => {
  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <input
        type="text"
        placeholder="Search logs..."
        className="px-3 py-2 border rounded"
        value={filter.keyword || ''}
        onChange={e => onChange({ ...filter, keyword: e.target.value })}
      />
      
      <select
        value={filter.level?.[0] || ''}
        onChange={e => onChange({ ...filter, level: [e.target.value as LogEntry['level']] })}
        className="px-3 py-2 border rounded"
      >
        <option value="">All Levels</option>
        <option value="INFO">Info</option>
        <option value="WARN">Warning</option>
        <option value="ERROR">Error</option>
        <option value="DEBUG">Debug</option>
      </select>

      <input
        type="date"
        className="px-3 py-2 border rounded"
        value={filter.startDate?.toISOString().split('T')[0] || ''}
        onChange={e => onChange({ 
          ...filter, 
          startDate: e.target.value ? new Date(e.target.value) : undefined 
        })}
      />
    </div>
  );
};