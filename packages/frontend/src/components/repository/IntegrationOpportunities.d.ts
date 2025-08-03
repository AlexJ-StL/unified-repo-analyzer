import React from 'react';
import { IntegrationOpportunity } from '@unified-repo-analyzer/shared/src/types/analysis';
interface IntegrationOpportunitiesProps {
    opportunities: IntegrationOpportunity[];
    onSelectOpportunity?: (opportunity: IntegrationOpportunity) => void;
}
declare const IntegrationOpportunities: React.FC<IntegrationOpportunitiesProps>;
export default IntegrationOpportunities;
