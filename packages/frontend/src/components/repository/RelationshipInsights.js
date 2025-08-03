import React from 'react';
const RelationshipInsightsComponent = ({ insights }) => {
    const getRelationshipStrength = () => {
        if (insights.totalRelationships === 0)
            return 0;
        return (insights.strongRelationships / insights.totalRelationships) * 100;
    };
    const getClusterDensity = () => {
        if (insights.totalRepositories === 0)
            return 0;
        return (insights.clusters / insights.totalRepositories) * 100;
    };
    return (<div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Repositories</p>
              <p className="text-2xl font-semibold text-gray-900">{insights.totalRepositories}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Relationships</p>
              <p className="text-2xl font-semibold text-gray-900">{insights.totalRelationships}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clusters</p>
              <p className="text-2xl font-semibold text-gray-900">{insights.clusters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Strong Relationships</p>
              <p className="text-2xl font-semibold text-gray-900">{insights.strongRelationships}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Relationship Strength and Cluster Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relationship Strength</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Strong relationships</span>
              <span className="font-medium">{getRelationshipStrength().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getRelationshipStrength()}%` }}/>
            </div>
            <p className="text-xs text-gray-500">
              {insights.strongRelationships} out of {insights.totalRelationships} relationships are
              strong ({'>'}70% similarity)
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cluster Density</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Clustering ratio</span>
              <span className="font-medium">{getClusterDensity().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(getClusterDensity(), 100)}%` }}/>
            </div>
            <p className="text-xs text-gray-500">
              {insights.clusters} clusters formed from {insights.totalRepositories} repositories
            </p>
          </div>
        </div>
      </div>

      {/* Top Languages and Frameworks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Languages</h3>
          <div className="space-y-3">
            {insights.topLanguages.slice(0, 8).map((lang, index) => (<div key={lang.language} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-800">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {lang.language}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{
                width: `${(lang.count / Math.max(...insights.topLanguages.map((l) => l.count))) * 100}%`,
            }}/>
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{lang.count}</span>
                </div>
              </div>))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Frameworks</h3>
          <div className="space-y-3">
            {insights.topFrameworks.slice(0, 8).map((framework, index) => (<div key={framework.framework} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-800">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {framework.framework}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{
                width: `${(framework.count / Math.max(...insights.topFrameworks.map((f) => f.count))) * 100}%`,
            }}/>
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{framework.count}</span>
                </div>
              </div>))}
          </div>
        </div>
      </div>

      {/* Architectural Patterns */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Architectural Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.architecturalPatterns.map((pattern) => (<div key={pattern.pattern} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{pattern.pattern}</span>
              <div className="flex items-center gap-2">
                <div className="w-12 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{
                width: `${(pattern.count / Math.max(...insights.architecturalPatterns.map((p) => p.count))) * 100}%`,
            }}/>
                </div>
                <span className="text-sm text-gray-500 w-6 text-right">{pattern.count}</span>
              </div>
            </div>))}
        </div>
        {insights.architecturalPatterns.length === 0 && (<p className="text-sm text-gray-500 text-center py-4">
            No architectural patterns detected in the current repository set.
          </p>)}
      </div>

      {/* Top Integration Opportunities */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Integration Opportunities</h3>
        <div className="space-y-3">
          {insights.integrationOpportunities.map((opportunity) => (<div key={opportunity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900">{opportunity.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opportunity.type === 'full-stack'
                ? 'bg-blue-100 text-blue-800'
                : opportunity.type === 'microservices'
                    ? 'bg-green-100 text-green-800'
                    : opportunity.type === 'library-ecosystem'
                        ? 'bg-purple-100 text-purple-800'
                        : opportunity.type === 'mobile-backend'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-yellow-100 text-yellow-800'}`}>
                    {opportunity.type.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{opportunity.description}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Priority: {opportunity.priority}/100
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${opportunity.estimatedEffort === 'low'
                ? 'bg-green-100 text-green-800'
                : opportunity.estimatedEffort === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'}`}>
                    {opportunity.estimatedEffort} effort
                  </div>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${opportunity.priority}%` }}/>
                </div>
              </div>
            </div>))}
        </div>
        {insights.integrationOpportunities.length === 0 && (<p className="text-sm text-gray-500 text-center py-4">
            No integration opportunities identified for the current repository set.
          </p>)}
      </div>
    </div>);
};
export default RelationshipInsightsComponent;
//# sourceMappingURL=RelationshipInsights.js.map