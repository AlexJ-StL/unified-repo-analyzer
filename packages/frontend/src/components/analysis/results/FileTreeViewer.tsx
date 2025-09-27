import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared/src/types/analysis';
import type {
  ClassInfo,
  FileInfo,
  FunctionInfo,
} from '@unified-repo-analyzer/shared/src/types/repository';
import type React from 'react';
import { useState } from 'react';

interface FileTreeViewerProps {
  analysis: RepositoryAnalysis;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
  fileInfo?: FileInfo;
}

const FileTreeViewer: React.FC<FileTreeViewerProps> = ({ analysis }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);

  // Build tree structure from file paths
  const buildFileTree = (): TreeNode => {
    const root: TreeNode = {
      name: analysis.name,
      path: '',
      isDirectory: true,
      children: [],
    };

    // Map to store file info by path for quick lookup
    const fileInfoMap = new Map<string, FileInfo>();
    analysis.structure.keyFiles.forEach((file: FileInfo) => {
      fileInfoMap.set(file.path, file);
    });

    // Process each file path
    analysis.structure.keyFiles.forEach((file: FileInfo) => {
      const pathParts = file.path.split('/').filter(Boolean);
      let currentNode = root;

      // Create path nodes
      pathParts.forEach((part: string, index: number) => {
        const isLastPart = index === pathParts.length - 1;
        const currentPath = pathParts.slice(0, index + 1).join('/');

        // Check if node already exists
        let node = currentNode.children.find((child) => child.name === part);

        if (!node) {
          node = {
            name: part,
            path: currentPath,
            isDirectory: !isLastPart,
            children: [],
            fileInfo: isLastPart ? file : undefined,
          };
          currentNode.children.push(node);
        }

        currentNode = node;
      });
    });

    return root;
  };

  const toggleNode = (path: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(path)) {
      newExpandedNodes.delete(path);
    } else {
      newExpandedNodes.add(path);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const selectFile = (fileInfo: FileInfo) => {
    setSelectedFile(fileInfo);
  };

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.path);
    const handleClick = () => {
      if (node.isDirectory) {
        toggleNode(node.path);
      } else if (node.fileInfo) {
        selectFile(node.fileInfo);
      }
    };

    return (
      <div key={node.path} className="select-none">
        <button
          type="button"
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${
            selectedFile && selectedFile.path === node.path ? 'bg-blue-100' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleClick();
          }}
        >
          {node.isDirectory ? (
            <svg
              className={`h-4 w-4 mr-1 text-gray-500 transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Expand directory</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 mr-1 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>File icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          )}
          <span className={`${node.isDirectory ? 'font-medium' : ''}`}>{node.name}</span>
          {node.fileInfo && (
            <span className="ml-2 text-xs text-gray-500">({node.fileInfo.language})</span>
          )}
        </button>

        {node.isDirectory && isExpanded && (
          <div>
            {node.children
              .sort((a, b) => {
                // Directories first, then files
                if (a.isDirectory !== b.isDirectory) {
                  return a.isDirectory ? -1 : 1;
                }
                // Alphabetical sort within each group
                return a.name.localeCompare(b.name);
              })
              .map((child) => (
                <div key={child.path}>{renderTreeNode(child, depth + 1)}</div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const fileTree = buildFileTree();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 border rounded-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h3 className="font-medium text-gray-700">File Structure</h3>
        </div>
        <div className="overflow-auto max-h-96 p-2">{renderTreeNode(fileTree)}</div>
      </div>

      <div className="md:col-span-2 border rounded-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h3 className="font-medium text-gray-700">
            {selectedFile
              ? `File Details: ${selectedFile.path.split('/').pop()}`
              : 'Select a file to view details'}
          </h3>
        </div>
        <div className="p-4">
          {selectedFile ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Path</h4>
                <p className="text-sm text-gray-600">{selectedFile.path}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Language</h4>
                  <p className="text-sm text-gray-600">{selectedFile.language}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Size</h4>
                  <p className="text-sm text-gray-600">{selectedFile.size} bytes</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Lines</h4>
                  <p className="text-sm text-gray-600">{selectedFile.lineCount}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Importance</h4>
                  <p className="text-sm text-gray-600">
                    {Math.round(selectedFile.importance * 100)}%
                  </p>
                </div>
              </div>

              {selectedFile.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="text-sm text-gray-600">{selectedFile.description}</p>
                </div>
              )}

              {selectedFile.useCase && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Use Case</h4>
                  <p className="text-sm text-gray-600">{selectedFile.useCase}</p>
                </div>
              )}

              {selectedFile.functions && selectedFile.functions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Functions</h4>
                  <ul className="mt-1 space-y-1">
                    {selectedFile.functions.map((func: FunctionInfo, _index: number) => (
                      <li
                        key={`${selectedFile.path}-func-${func.name}`}
                        className="text-sm text-gray-600"
                      >
                        <span className="font-mono">{func.name}</span>
                        {func.description && (
                          <span className="text-xs text-gray-500 ml-2">- {func.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedFile.classes && selectedFile.classes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Classes</h4>
                  <ul className="mt-1 space-y-1">
                    {selectedFile.classes.map((cls: ClassInfo, _index: number) => (
                      <li
                        key={`${selectedFile.path}-class-${cls.name}`}
                        className="text-sm text-gray-600"
                      >
                        <span className="font-mono">{cls.name}</span>
                        {cls.description && (
                          <span className="text-xs text-gray-500 ml-2">- {cls.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select a file from the tree to view its details
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileTreeViewer;
