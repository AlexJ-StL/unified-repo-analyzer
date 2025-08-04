import React from 'react';
import { RepositoryAnalysis, BatchAnalysisResult } from '@unified-repo-analyzer/shared';
interface ExportButtonProps {
    analysis?: RepositoryAnalysis;
    batchAnalysis?: BatchAnalysisResult;
    className?: string;
}
declare const ExportButton: React.FC<ExportButtonProps>;
export default ExportButton;
