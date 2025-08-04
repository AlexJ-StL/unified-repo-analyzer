import React from 'react';
import { OutputFormat } from '@unified-repo-analyzer/shared';
interface ExportHistoryItem {
    id: string;
    format: OutputFormat;
    filename: string;
    timestamp: Date;
    downloadUrl: string;
    size?: number;
    analysisName?: string;
    type: 'single' | 'batch';
}
interface ExportHistoryProps {
    className?: string;
}
declare const ExportHistory: React.FC<ExportHistoryProps>;
export declare const addExportToHistory: (item: Omit<ExportHistoryItem, "timestamp">) => void;
export default ExportHistory;
