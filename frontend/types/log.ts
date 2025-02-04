export interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    message: string;
    metadata: null; 
  }
  
  
export interface LogAnalysis {
    total_entries: number;
    by_level: Record<string, number>;
    error_rate: number;
    patterns: Pattern[];
    time_series: TimePoint[];
    anomalies: Anomaly[];
    processing_time: string;
}
  
export interface Pattern {
    pattern: string;
    occurrences: number;
    examples: string[];
}
  
export interface TimePoint {
    timestamp: string;
    count: number;
    error_count: number;
}
  
export interface Anomaly {
    timestamp: string;
    metric: string;
    value: number;
    threshold: number;
}
  
export interface LogFilter {
    startDate?: Date;
    endDate?: Date;
    level?: LogEntry['level'][];
    keyword?: string;
}