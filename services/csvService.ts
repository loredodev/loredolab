import Papa from 'papaparse';
import { LogEntry } from '../types';

export interface CsvParseResult {
  data: LogEntry[];
  errors: string[];
}

// Heuristic to map common CSV headers to our internal model
const mapRowToLogEntry = (row: any): LogEntry | null => {
  // Try to find keys that match expectations (case insensitive)
  const keys = Object.keys(row);
  
  const dateKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('data'));
  const valueKey = keys.find(k => k.toLowerCase().includes('value') || k.toLowerCase().includes('score') || k.toLowerCase().includes('valor'));
  const noteKey = keys.find(k => k.toLowerCase().includes('note') || k.toLowerCase().includes('nota') || k.toLowerCase().includes('desc'));

  if (!dateKey || !valueKey) {
    return null; 
  }

  const value = parseFloat(row[valueKey]);
  if (isNaN(value)) return null;

  return {
    date: new Date(row[dateKey]).toISOString(),
    metricValue: Math.min(Math.max(value, 1), 10), // Clamp between 1-10
    notes: noteKey ? row[noteKey] : ''
  };
};

export const parseLogCSV = (file: File): Promise<CsvParseResult> => {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const logs: LogEntry[] = [];
                const errors: string[] = [];
                
                results.data.forEach((row: any, index) => {
                    const entry = mapRowToLogEntry(row);
                    if (entry) {
                        logs.push(entry);
                    } else {
                         // Only report error if row isn't practically empty
                         if (Object.keys(row).length > 0) {
                            errors.push(`Row ${index + 1}: Missing 'Date' or 'Value' column, or invalid data.`);
                         }
                    }
                });
                
                resolve({ data: logs, errors });
            },
            error: (err) => {
                resolve({ data: [], errors: [err.message] });
            }
        });
    });
};