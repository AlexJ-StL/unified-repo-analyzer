import React from 'react';
import { RepositoryAnalysis, BatchAnalysisResult } from '@unified-repo-analyzer/shared';
interface PrintableReportProps {
  analysis?: RepositoryAnalysis;
  batchAnalysis?: BatchAnalysisResult;
  className?: string;
}
declare const PrintableReport: React.FC<PrintableReportProps>;
export default PrintableReport;
