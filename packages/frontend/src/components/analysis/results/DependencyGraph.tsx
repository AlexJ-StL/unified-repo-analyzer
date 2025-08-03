import type { RepositoryAnalysis } from "@unified-repo-analyzer/shared";
import * as d3 from "d3";
import type React from "react";
import { useEffect, useRef } from "react";

interface DependencyGraphProps {
	analysis: RepositoryAnalysis;
}

interface Node extends d3.SimulationNodeDatum {
	id: string;
	name: string;
	type: "production" | "development" | "framework" | "repository";
	group: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
	source: string | Node;
	target: string | Node;
	value: number;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ analysis }) => {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!svgRef.current) return;

		// Clear any existing graph
		d3.select(svgRef.current).selectAll("*").remove();

		// Prepare data for visualization
		const nodes: Node[] = [
			// Repository as central node
			{ id: "repo", name: analysis.name, type: "repository", group: 0 },

			// Production dependencies
			...analysis.dependencies.production.map((dep) => ({
				id: `prod-${dep.name}`,
				name: dep.name,
				type: "production" as const,
				group: 1,
			})),

			// Development dependencies
			...analysis.dependencies.development.map((dep) => ({
				id: `dev-${dep.name}`,
				name: dep.name,
				type: "development" as const,
				group: 2,
			})),

			// Frameworks
			...analysis.dependencies.frameworks.map((framework) => ({
				id: `framework-${framework.name}`,
				name: framework.name,
				type: "framework" as const,
				group: 3,
			})),
		];

		// Create links from repository to dependencies
		const links: Link[] = [
			// Links to production dependencies
			...analysis.dependencies.production.map((dep) => ({
				source: "repo",
				target: `prod-${dep.name}`,
				value: 2, // Thicker lines for production deps
			})),

			// Links to development dependencies
			...analysis.dependencies.development.map((dep) => ({
				source: "repo",
				target: `dev-${dep.name}`,
				value: 1, // Thinner lines for dev deps
			})),

			// Links to frameworks
			...analysis.dependencies.frameworks.map((framework) => ({
				source: "repo",
				target: `framework-${framework.name}`,
				value: 3, // Thickest lines for frameworks
			})),
		];

		// Set up the SVG container
		const width = svgRef.current.clientWidth;
		const height = 500;

		const svg = d3
			.select(svgRef.current)
			.attr("width", width)
			.attr("height", height);

		// Create a force simulation
		const simulation = d3
			.forceSimulation<Node>(nodes)
			.force(
				"link",
				d3
					.forceLink<Node, Link>(links)
					.id((d) => d.id)
					.distance(100),
			)
			.force("charge", d3.forceManyBody().strength(-300))
			.force("center", d3.forceCenter(width / 2, height / 2))
			.force("collision", d3.forceCollide().radius(40));

		// Define color scale for node types
		const color = d3
			.scaleOrdinal<string>()
			.domain(["repository", "production", "development", "framework"])
			.range(["#4f46e5", "#10b981", "#f59e0b", "#ef4444"]);

		// Create links
		const link = svg
			.append("g")
			.selectAll("line")
			.data(links)
			.join("line")
			.attr("stroke", "#999")
			.attr("stroke-opacity", 0.6)
			.attr("stroke-width", (d) => d.value);

		// Create node groups
		const node = svg
			.append("g")
			.selectAll(".node")
			.data(nodes)
			.join("g")
			.attr("class", "node")
			.call(
				d3
					.drag<SVGGElement, Node>()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended) as any,
			);

		// Add circles to nodes
		node
			.append("circle")
			.attr("r", (d) => (d.type === "repository" ? 25 : 15))
			.attr("fill", (d) => color(d.type))
			.attr("stroke", "#fff")
			.attr("stroke-width", 1.5);

		// Add text labels
		node
			.append("text")
			.attr("dx", (d) => (d.type === "repository" ? 30 : 20))
			.attr("dy", ".35em")
			.text((d) => d.name)
			.attr("font-size", (d) => (d.type === "repository" ? "14px" : "12px"))
			.attr("fill", "#333");

		// Add title for tooltips
		node.append("title").text((d) => `${d.name} (${d.type})`);

		// Update positions on each tick
		simulation.on("tick", () => {
			link
				.attr("x1", (d) => (d.source as Node).x || 0)
				.attr("y1", (d) => (d.source as Node).y || 0)
				.attr("x2", (d) => (d.target as Node).x || 0)
				.attr("y2", (d) => (d.target as Node).y || 0);

			node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
		});

		// Drag functions
		function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}

		// Cleanup
		return () => {
			simulation.stop();
		};
	}, [analysis]);

	// If there are no dependencies, show a message
	const hasDependencies =
		analysis.dependencies.production.length > 0 ||
		analysis.dependencies.development.length > 0 ||
		analysis.dependencies.frameworks.length > 0;

	if (!hasDependencies) {
		return (
			<div className="text-center py-10">
				<p className="text-gray-500">
					No dependencies found for this repository.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold text-gray-800">
					Dependency Graph
				</h3>
				<div className="flex space-x-4">
					<div className="flex items-center">
						<span className="inline-block w-3 h-3 rounded-full bg-[#4f46e5] mr-2"></span>
						<span className="text-sm text-gray-600">Repository</span>
					</div>
					<div className="flex items-center">
						<span className="inline-block w-3 h-3 rounded-full bg-[#10b981] mr-2"></span>
						<span className="text-sm text-gray-600">Production</span>
					</div>
					<div className="flex items-center">
						<span className="inline-block w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></span>
						<span className="text-sm text-gray-600">Development</span>
					</div>
					<div className="flex items-center">
						<span className="inline-block w-3 h-3 rounded-full bg-[#ef4444] mr-2"></span>
						<span className="text-sm text-gray-600">Framework</span>
					</div>
				</div>
			</div>

			<div className="border rounded-md p-2 bg-gray-50">
				<svg
					ref={svgRef}
					className="w-full"
					style={{ minHeight: "500px" }}
				></svg>
			</div>

			<p className="text-sm text-gray-500 italic">
				Drag nodes to rearrange the graph. Hover over nodes to see details.
			</p>
		</div>
	);
};

export default DependencyGraph;
