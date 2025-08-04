import React from 'react';
import { AnalysisOptions } from '../../store/useAnalysisStore';
interface AnalysisConfigurationProps {
    onConfigChange?: (options: AnalysisOptions) => void;
    className?: string;
}
declare const AnalysisConfiguration: React.FC<AnalysisConfigurationProps>;
export default AnalysisConfiguration;
