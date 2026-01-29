import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Check, X } from 'lucide-react';
import { parseLogCSV } from '../services/csvService';
import { LogEntry, ExperimentStatus, Language } from '../types';
import { CONTENT } from '../constants';

interface CsvUploaderProps {
    onUploadComplete: (logs: LogEntry[], targetStatus: ExperimentStatus) => void;
    onCancel: () => void;
    lang: Language;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onUploadComplete, onCancel, lang }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewLogs, setPreviewLogs] = useState<LogEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [targetStatus, setTargetStatus] = useState<ExperimentStatus>(ExperimentStatus.BASELINE);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const t = CONTENT[lang];

    const handleFile = async (file: File) => {
        setError(null);
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Please upload a valid CSV file.');
            return;
        }

        const result = await parseLogCSV(file);
        
        if (result.errors.length > 0 && result.data.length === 0) {
            setError(t.csv.error);
        } else {
            setPreviewLogs(result.data);
            if (result.data.length === 0) {
                setError("No valid entries found. Check your column headers.");
            }
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleImport = () => {
        if (previewLogs.length > 0) {
            onUploadComplete(previewLogs, targetStatus);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-lab-200 shadow-lg max-w-lg w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-lab-900">{t.csv.title}</h3>
                <button onClick={onCancel} className="text-lab-400 hover:text-lab-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {previewLogs.length === 0 ? (
                <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        isDragging ? 'border-primary-500 bg-primary-50' : 'border-lab-300 hover:border-primary-400'
                    }`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-10 h-10 text-lab-400 mx-auto mb-3" />
                    <p className="text-sm text-lab-600 font-medium mb-1">{t.csv.dragDrop}</p>
                    <p className="text-xs text-lab-400">{t.csv.supported}</p>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".csv"
                        onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
                    />
                    {error && (
                        <div className="mt-4 flex items-center justify-center text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" /> {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center text-sm">
                        <Check className="w-4 h-4 mr-2" />
                        {previewLogs.length} {t.csv.success}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-lab-700 mb-2">{t.csv.importAs}</label>
                        <select 
                            value={targetStatus}
                            onChange={(e) => setTargetStatus(e.target.value as ExperimentStatus)}
                            className="w-full border border-lab-300 rounded-md p-2 text-sm"
                        >
                            <option value={ExperimentStatus.BASELINE}>{t.phases.baseline}</option>
                            <option value={ExperimentStatus.INTERVENTION}>{t.phases.intervention}</option>
                        </select>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-lab-500 mb-2 uppercase">{t.csv.preview}</p>
                        <div className="bg-lab-50 rounded-md p-2 space-y-2 max-h-40 overflow-auto">
                            {previewLogs.slice(0, 3).map((log, i) => (
                                <div key={i} className="text-xs text-lab-700 flex justify-between border-b border-lab-200 pb-1 last:border-0">
                                    <span>{new Date(log.date).toLocaleDateString()}</span>
                                    <span className="font-mono font-bold">{log.metricValue}</span>
                                    <span className="truncate w-1/3 text-lab-400">{log.notes}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                        <button 
                            onClick={handleImport}
                            className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                        >
                            {t.csv.importButton}
                        </button>
                        <button 
                            onClick={() => { setPreviewLogs([]); setError(null); }}
                            className="px-4 py-2 border border-lab-300 rounded-lg text-lab-600 hover:bg-lab-50"
                        >
                            {t.csv.cancel}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};