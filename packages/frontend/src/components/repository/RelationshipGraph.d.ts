import React from 'react';
import {
  RelationshipGraph,
  GraphNode,
  GraphEdge,
} from '@unified-repo-analyzer/shared/src/types/analysis';
interface RelationshipGraphProps {
  data: RelationshipGraph;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
}
declare const RelationshipGraphComponent: React.FC<RelationshipGraphProps>;
export default RelationshipGraphComponent;
