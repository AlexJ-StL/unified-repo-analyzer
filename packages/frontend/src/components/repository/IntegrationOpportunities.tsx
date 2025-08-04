import type { IntegrationOpportunity } from '@unified-repo-analyzer/shared/src/types/analysis';
import type React from 'react';
import { useState } from 'react';

interface IntegrationOpportunitiesProps {
  opportunities: IntegrationOpportunity[];
  onSelectOpportunity?: (opportunity: IntegrationOpportunity) => void;
}

const IntegrationOpportunities: React.FC<IntegrationOpportunitiesProps> = ({
  opportunities,
  onSelectOpportunity,
}) => {
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter opportunities by type
  const filteredOpportunities =
    selectedType === 'all'
      ? opportunities
      : opportunities.filter((opp) => opp.type === selectedType);

  // Sort by priority
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => b.priority - a.priority);

  const getTypeColor = (type: IntegrationOpportunity['type']) => {
    const colors = {
      'full-stack': 'bg-blue-100 text-blue-800',
      microservices: 'bg-green-100 text-green-800',
      'library-ecosystem': 'bg-purple-100 text-purple-800',
      'mobile-backend': 'bg-pink-100 text-pink-800',
      'tool-chain': 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEffortColor = (effort: IntegrationOpportunity['estimatedEffort']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[effort];
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'bg-red-100 text-red-800';
    if (priority >= 60) return 'bg-orange-100 text-orange-800';
    if (priority >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const uniqueTypes = [...new Set(opportunities.map((opp) => opp.type))];

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Integration Opportunities</h3>
        <p className="mt-1 text-sm text-gray-500">
          No viable integration opportunities found for the selected repositories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedType === 'all'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({opportunities.length})
        </button>
        {uniqueTypes.map((type) => {
          const count = opportunities.filter((opp) => opp.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                selectedType === type
                  ? getTypeColor(type)
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.replace('-', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Opportunities List */}
      <div className="space-y-3">
        {sortedOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{opportunity.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}
                    >
                      {opportunity.type.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{opportunity.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Effort:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEffortColor(opportunity.estimatedEffort)}`}
                      >
                        {opportunity.estimatedEffort}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Priority:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(opportunity.priority)}`}
                      >
                        {opportunity.priority}/100
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Repositories:</span>
                      <span className="text-gray-900 font-medium">
                        {opportunity.repositories.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onSelectOpportunity?.(opportunity)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() =>
                      setExpandedOpportunity(
                        expandedOpportunity === opportunity.id ? null : opportunity.id
                      )
                    }
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className={`h-5 w-5 transform transition-transform ${
                        expandedOpportunity === opportunity.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOpportunity === opportunity.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Benefits */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {opportunity.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <svg
                              className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Challenges */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Challenges</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {opportunity.challenges.map((challenge, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <svg
                              className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Implementation Steps */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Implementation Steps
                      </h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        {opportunity.implementationSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sortedOpportunities.length === 0 && selectedType !== 'all' && (
        <div className="text-center py-8 text-gray-500">
          <p>No {selectedType.replace('-', ' ')} opportunities found.</p>
        </div>
      )}
    </div>
  );
};

export default IntegrationOpportunities;
