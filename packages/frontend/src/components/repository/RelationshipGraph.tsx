import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  RelationshipGraph,
  GraphNode,
  GraphEdge,
  GraphCluster,
} from '@unified-repo-analyzer/shared/src/types/analysis';

interface RelationshipGraphProps {
  data: RelationshipGraph;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
}

const RelationshipGraphComponent: React.FC<RelationshipGraphProps> = ({
  data,
  width = 800,
  height = 600,
  onNodeClick,
  onEdgeClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(data.nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphEdge>(data.edges)
          .id((d) => d.id)
          .distance((d) => 100 / (d.strength + 0.1))
          .strength((d) => d.strength)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Color scales
    const nodeTypeColors = {
      frontend: '#61dafb',
      backend: '#68d391',
      mobile: '#f687b3',
      library: '#fbb6ce',
      tool: '#9f7aea',
      application: '#4fd1c7',
    };

    const edgeTypeColors = {
      similar: '#4299e1',
      complementary: '#48bb78',
      dependency: '#ed8936',
      fork: '#9f7aea',
    };

    // Draw clusters first (as background)
    const clusterGroup = g.append('g').attr('class', 'clusters');

    data.clusters.forEach((cluster) => {
      const clusterNodes = data.nodes.filter((node) => cluster.repositories.includes(node.id));
      if (clusterNodes.length < 2) return;

      // Calculate cluster bounds
      const padding = 40;
      const xs = clusterNodes.map((n) => n.x || 0);
      const ys = clusterNodes.map((n) => n.y || 0);
      const minX = Math.min(...xs) - padding;
      const maxX = Math.max(...xs) + padding;
      const minY = Math.min(...ys) - padding;
      const maxY = Math.max(...ys) + padding;

      clusterGroup
        .append('rect')
        .attr('x', minX)
        .attr('y', minY)
        .attr('width', maxX - minX)
        .attr('height', maxY - minY)
        .attr('fill', cluster.color)
        .attr('fill-opacity', 0.1)
        .attr('stroke', cluster.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('rx', 10);

      clusterGroup
        .append('text')
        .attr('x', minX + 10)
        .attr('y', minY + 20)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', cluster.color)
        .text(cluster.name);
    });

    // Draw edges
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.edges)
      .enter()
      .append('line')
      .attr('stroke', (d) => edgeTypeColors[d.type])
      .attr('stroke-width', (d) => Math.max(1, d.strength * 4))
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onEdgeClick?.(d);
      })
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke-opacity', 1);

        // Show tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'relationship-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000').html(`
            <strong>${d.type.charAt(0).toUpperCase() + d.type.slice(1)} Relationship</strong><br/>
            Strength: ${(d.strength * 100).toFixed(0)}%<br/>
            ${d.reason}
          `);

        tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('stroke-opacity', 0.6);
        d3.selectAll('.relationship-tooltip').remove();
      });

    // Draw nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Add circles for nodes
    node
      .append('circle')
      .attr('r', (d) => Math.max(15, Math.sqrt(d.size / 100000) * 10))
      .attr('fill', (d) => nodeTypeColors[d.type])
      .attr('stroke', (d) => (selectedNode === d.id ? '#000' : '#fff'))
      .attr('stroke-width', (d) => (selectedNode === d.id ? 3 : 2))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(selectedNode === d.id ? null : d.id);
        onNodeClick?.(d);
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d.id);

        // Highlight connected edges
        link.attr('stroke-opacity', (edge) =>
          edge.source === d.id || edge.target === d.id ? 1 : 0.2
        );

        // Show tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'node-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000').html(`
            <strong>${d.name}</strong><br/>
            Type: ${d.type}<br/>
            Languages: ${d.languages.join(', ')}<br/>
            Frameworks: ${d.frameworks.join(', ')}<br/>
            Size: ${(d.size / 1000).toFixed(0)}KB<br/>
            Complexity: ${d.complexity.toFixed(1)}
          `);

        tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', (event, d) => {
        setHoveredNode(null);
        link.attr('stroke-opacity', 0.6);
        d3.selectAll('.node-tooltip').remove();
      });

    // Add labels
    node
      .append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .attr('pointer-events', 'none')
      .text((d) => (d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name));

    // Add type indicators
    node
      .append('text')
      .attr('dy', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', '#666')
      .attr('pointer-events', 'none')
      .text((d) => d.type.toUpperCase());

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x || 0)
        .attr('y1', (d) => (d.source as GraphNode).y || 0)
        .attr('x2', (d) => (d.target as GraphNode).x || 0)
        .attr('y2', (d) => (d.target as GraphNode).y || 0);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);

      // Update cluster positions
      data.clusters.forEach((cluster, index) => {
        const clusterNodes = data.nodes.filter((node) => cluster.repositories.includes(node.id));
        if (clusterNodes.length < 2) return;

        const padding = 40;
        const xs = clusterNodes.map((n) => n.x || 0);
        const ys = clusterNodes.map((n) => n.y || 0);
        const minX = Math.min(...xs) - padding;
        const maxX = Math.max(...xs) + padding;
        const minY = Math.min(...ys) - padding;
        const maxY = Math.max(...ys) + padding;

        clusterGroup
          .selectAll('rect')
          .filter((d, i) => i === index)
          .attr('x', minX)
          .attr('y', minY)
          .attr('width', maxX - minX)
          .attr('height', maxY - minY);

        clusterGroup
          .selectAll('text')
          .filter((d, i) => i === index)
          .attr('x', minX + 10)
          .attr('y', minY + 20);
      });
    });

    // Cleanup function
    return () => {
      simulation.stop();
      d3.selectAll('.node-tooltip').remove();
      d3.selectAll('.relationship-tooltip').remove();
    };
  }, [data, width, height, selectedNode]);

  return (
    <div className="relationship-graph">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Node Types:</span>
          {Object.entries({
            frontend: '#61dafb',
            backend: '#68d391',
            mobile: '#f687b3',
            library: '#fbb6ce',
            tool: '#9f7aea',
            application: '#4fd1c7',
          }).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">Relationships:</span>
          {Object.entries({
            similar: '#4299e1',
            complementary: '#48bb78',
            dependency: '#ed8936',
            fork: '#9f7aea',
          }).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-4 h-0.5" style={{ backgroundColor: color }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelationshipGraphComponent;
