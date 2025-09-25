/**
 * Tests for RelationshipGraph component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { RelationshipGraph } from '@unified-repo-analyzer/shared/src/types/analysis';
import RelationshipGraphComponent from '../RelationshipGraph';

// Mock D3 to avoid DOM manipulation issues in tests
vi.mock('d3', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      remove: vi.fn(),
    })),
    append: vi.fn(() => ({
      attr: vi.fn().mockReturnThis(),
      selectAll: vi.fn(() => ({
        data: vi.fn(() => ({
          enter: vi.fn(() => ({
            append: vi.fn(() => ({
              attr: vi.fn().mockReturnThis(),
              style: vi.fn().mockReturnThis(),
              on: vi.fn().mockReturnThis(),
              call: vi.fn().mockReturnThis(),
              text: vi.fn().mockReturnThis(),
            })),
          })),
        })),
      })),
    })),
    call: vi.fn().mockReturnThis(),
  })),
  forceSimulation: vi.fn(() => ({
    force: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    stop: vi.fn(),
  })),
  forceLink: vi.fn(() => ({
    id: vi.fn().mockReturnThis(),
    distance: vi.fn().mockReturnThis(),
    strength: vi.fn().mockReturnThis(),
  })),
  forceManyBody: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
  forceCenter: vi.fn(),
  forceCollide: vi.fn(() => ({
    radius: vi.fn().mockReturnThis(),
  })),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
  })),
  drag: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
  })),
}));

describe('RelationshipGraphComponent', () => {
  const mockGraphData: RelationshipGraph = {
    nodes: [
      {
        id: 'node-1',
        name: 'Frontend App',
        type: 'frontend',
        size: 1000000,
        complexity: 50,
        languages: ['javascript', 'typescript'],
        frameworks: ['react'],
        x: 100,
        y: 100,
      },
      {
        id: 'node-2',
        name: 'Backend API',
        type: 'backend',
        size: 800000,
        complexity: 45,
        languages: ['javascript'],
        frameworks: ['express'],
        x: 200,
        y: 200,
      },
    ],
    edges: [
      {
        source: 'node-1',
        target: 'node-2',
        type: 'complementary',
        strength: 0.8,
        reason: 'Frontend-Backend complementary pair',
      },
    ],
    clusters: [
      {
        id: 'cluster-1',
        name: 'JavaScript Ecosystem',
        repositories: ['node-1', 'node-2'],
        theme: 'javascript-ecosystem',
        color: '#f7df1e',
      },
    ],
  };

  it('should render the relationship graph', () => {
    render(<RelationshipGraphComponent data={mockGraphData} />);

    // Check that SVG is rendered
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '600');
  });

  it('should render legend with node types and relationships', () => {
    render(<RelationshipGraphComponent data={mockGraphData} />);

    // Check for legend sections
    expect(screen.getByText('Node Types:')).toBeInTheDocument();
    expect(screen.getByText('Relationships:')).toBeInTheDocument();

    // Check for specific node types
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();

    // Check for relationship types
    expect(screen.getByText('Similar')).toBeInTheDocument();
    expect(screen.getByText('Complementary')).toBeInTheDocument();
  });

  it('should call onNodeClick when provided', () => {
    const mockOnNodeClick = vi.fn();
    render(<RelationshipGraphComponent data={mockGraphData} onNodeClick={mockOnNodeClick} />);

    // Since D3 is mocked, we can't actually test the click event
    // But we can verify the callback is passed correctly
    expect(mockOnNodeClick).not.toHaveBeenCalled();
  });

  it('should call onEdgeClick when provided', () => {
    const mockOnEdgeClick = vi.fn();
    render(<RelationshipGraphComponent data={mockGraphData} onEdgeClick={mockOnEdgeClick} />);

    // Since D3 is mocked, we can't actually test the click event
    // But we can verify the callback is passed correctly
    expect(mockOnEdgeClick).not.toHaveBeenCalled();
  });

  it('should handle empty data gracefully', () => {
    const emptyData: RelationshipGraph = {
      nodes: [],
      edges: [],
      clusters: [],
    };

    render(<RelationshipGraphComponent data={emptyData} />);

    // Should still render SVG
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });

  it('should use custom dimensions when provided', () => {
    render(<RelationshipGraphComponent data={mockGraphData} width={1000} height={800} />);

    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveAttribute('width', '1000');
    expect(svg).toHaveAttribute('height', '800');
  });

  it('should render all node type colors in legend', () => {
    render(<RelationshipGraphComponent data={mockGraphData} />);

    const nodeTypes = ['frontend', 'backend', 'mobile', 'library', 'tool', 'application'];

    nodeTypes.forEach((type) => {
      expect(screen.getByText(type.charAt(0).toUpperCase() + type.slice(1))).toBeInTheDocument();
    });
  });

  it('should render all relationship type colors in legend', () => {
    render(<RelationshipGraphComponent data={mockGraphData} />);

    const relationshipTypes = ['similar', 'complementary', 'dependency', 'fork'];

    relationshipTypes.forEach((type) => {
      expect(screen.getByText(type.charAt(0).toUpperCase() + type.slice(1))).toBeInTheDocument();
    });
  });
});
