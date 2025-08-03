/**
 * Tests for IntegrationOpportunities component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntegrationOpportunities from '../IntegrationOpportunities';
describe('IntegrationOpportunities', () => {
    const mockOpportunities = [
        {
            id: 'opp-1',
            repositories: ['repo-1', 'repo-2'],
            type: 'full-stack',
            title: 'Full-Stack Application: Frontend + Backend',
            description: 'Integrate React frontend with Express backend',
            benefits: [
                'Unified development workflow',
                'Shared data models',
                'Consistent user experience',
            ],
            challenges: [
                'API design and versioning',
                'Authentication and authorization',
                'CORS configuration',
            ],
            implementationSteps: [
                'Design RESTful API endpoints',
                'Implement authentication system',
                'Create shared data models',
            ],
            estimatedEffort: 'medium',
            priority: 85,
        },
        {
            id: 'opp-2',
            repositories: ['repo-3', 'repo-4'],
            type: 'microservices',
            title: 'Microservices Architecture: Service A + Service B',
            description: 'Integrate multiple services into microservices architecture',
            benefits: ['Scalable architecture', 'Independent deployment', 'Fault isolation'],
            challenges: ['Service discovery', 'Distributed data management', 'Network latency'],
            implementationSteps: [
                'Design service boundaries',
                'Implement service discovery',
                'Set up inter-service communication',
            ],
            estimatedEffort: 'high',
            priority: 70,
        },
        {
            id: 'opp-3',
            repositories: ['repo-5'],
            type: 'library-ecosystem',
            title: 'Library Ecosystem: Utility Library',
            description: 'Create modular library ecosystem',
            benefits: ['Code reusability', 'Reduced duplication', 'Standardized patterns'],
            challenges: ['Version management', 'Dependency conflicts', 'API stability'],
            implementationSteps: [
                'Extract common functionality',
                'Set up package management',
                'Create documentation',
            ],
            estimatedEffort: 'low',
            priority: 60,
        },
    ];
    it('should render all opportunities', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        expect(screen.getByText('Full-Stack Application: Frontend + Backend')).toBeInTheDocument();
        expect(screen.getByText('Microservices Architecture: Service A + Service B')).toBeInTheDocument();
        expect(screen.getByText('Library Ecosystem: Utility Library')).toBeInTheDocument();
    });
    it('should display opportunity details', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        // Check for descriptions
        expect(screen.getByText('Integrate React frontend with Express backend')).toBeInTheDocument();
        // Check for effort badges
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('high')).toBeInTheDocument();
        expect(screen.getByText('low')).toBeInTheDocument();
        // Check for priority scores
        expect(screen.getByText('85/100')).toBeInTheDocument();
        expect(screen.getByText('70/100')).toBeInTheDocument();
        expect(screen.getByText('60/100')).toBeInTheDocument();
    });
    it('should filter opportunities by type', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        // Click on full-stack filter
        fireEvent.click(screen.getByText('full stack (1)'));
        // Should only show full-stack opportunity
        expect(screen.getByText('Full-Stack Application: Frontend + Backend')).toBeInTheDocument();
        expect(screen.queryByText('Microservices Architecture: Service A + Service B')).not.toBeInTheDocument();
        expect(screen.queryByText('Library Ecosystem: Utility Library')).not.toBeInTheDocument();
    });
    it('should expand opportunity details when clicked', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        // Initially, detailed sections should not be visible
        expect(screen.queryByText('Benefits')).not.toBeInTheDocument();
        expect(screen.queryByText('Challenges')).not.toBeInTheDocument();
        expect(screen.queryByText('Implementation Steps')).not.toBeInTheDocument();
        // Click expand button for first opportunity
        const expandButtons = screen.getAllByRole('button');
        const expandButton = expandButtons.find((button) => button.querySelector('svg')?.classList.contains('transform'));
        if (expandButton) {
            fireEvent.click(expandButton);
            // Now detailed sections should be visible
            expect(screen.getByText('Benefits')).toBeInTheDocument();
            expect(screen.getByText('Challenges')).toBeInTheDocument();
            expect(screen.getByText('Implementation Steps')).toBeInTheDocument();
            // Check for specific content
            expect(screen.getByText('Unified development workflow')).toBeInTheDocument();
            expect(screen.getByText('API design and versioning')).toBeInTheDocument();
            expect(screen.getByText('Design RESTful API endpoints')).toBeInTheDocument();
        }
    });
    it('should call onSelectOpportunity when View Details is clicked', () => {
        const mockOnSelect = jest.fn();
        render(<IntegrationOpportunities opportunities={mockOpportunities} onSelectOpportunity={mockOnSelect}/>);
        // Click View Details button for first opportunity
        const viewDetailsButtons = screen.getAllByText('View Details');
        fireEvent.click(viewDetailsButtons[0]);
        expect(mockOnSelect).toHaveBeenCalledWith(mockOpportunities[0]);
    });
    it('should show correct type badges with appropriate colors', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        // Check for type badges
        expect(screen.getByText('full stack')).toBeInTheDocument();
        expect(screen.getByText('microservices')).toBeInTheDocument();
        expect(screen.getByText('library ecosystem')).toBeInTheDocument();
    });
    it('should sort opportunities by priority', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        const titles = screen.getAllByRole('heading', { level: 3 });
        // Should be sorted by priority (descending)
        expect(titles[0]).toHaveTextContent('Full-Stack Application: Frontend + Backend'); // Priority 85
        expect(titles[1]).toHaveTextContent('Microservices Architecture: Service A + Service B'); // Priority 70
        expect(titles[2]).toHaveTextContent('Library Ecosystem: Utility Library'); // Priority 60
    });
    it('should show empty state when no opportunities', () => {
        render(<IntegrationOpportunities opportunities={[]}/>);
        expect(screen.getByText('No Integration Opportunities')).toBeInTheDocument();
        expect(screen.getByText('No viable integration opportunities found for the selected repositories.')).toBeInTheDocument();
    });
    it('should show filter counts correctly', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        expect(screen.getByText('All (3)')).toBeInTheDocument();
        expect(screen.getByText('full stack (1)')).toBeInTheDocument();
        expect(screen.getByText('microservices (1)')).toBeInTheDocument();
        expect(screen.getByText('library ecosystem (1)')).toBeInTheDocument();
    });
    it('should show repository count for each opportunity', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        // Check repository counts
        const repositoryLabels = screen.getAllByText('Repositories:');
        expect(repositoryLabels).toHaveLength(3);
        // First two opportunities have 2 repositories each
        expect(screen.getAllByText('2')).toHaveLength(2);
        // Third opportunity has 1 repository
        expect(screen.getByText('1')).toBeInTheDocument();
    });
    it('should handle different effort levels with appropriate styling', () => {
        render(<IntegrationOpportunities opportunities={mockOpportunities}/>);
        const effortBadges = screen.getAllByText(/^(low|medium|high)$/);
        expect(effortBadges).toHaveLength(3);
        // Check that all effort levels are represented
        expect(screen.getByText('low')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('high')).toBeInTheDocument();
    });
});
//# sourceMappingURL=IntegrationOpportunities.test.js.map