/**
 * Workspace management component
 */

import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToast } from '../../hooks/useToast';
import { WorkspaceConfiguration } from '@unified-repo-analyzer/shared';

const WorkspaceManager: React.FC = () => {
  const { workspaces, loadWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } =
    useSettingsStore();
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    path: '',
  });

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.path.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await createWorkspace({
        name: formData.name,
        path: formData.path,
        preferences: {},
      });
      setIsCreating(false);
      setFormData({ name: '', path: '' });
      showToast('Workspace created successfully', 'success');
    } catch (error) {
      showToast('Failed to create workspace', 'error');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim() || !formData.path.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await updateWorkspace(id, {
        name: formData.name,
        path: formData.path,
      });
      setEditingId(null);
      setFormData({ name: '', path: '' });
      showToast('Workspace updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update workspace', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the workspace "${name}"?`)) {
      try {
        await deleteWorkspace(id);
        showToast('Workspace deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete workspace', 'error');
      }
    }
  };

  const startEdit = (workspace: WorkspaceConfiguration) => {
    setEditingId(workspace.id);
    setFormData({
      name: workspace.name,
      path: workspace.path,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', path: '' });
  };

  const selectDirectory = async () => {
    // In a real implementation, this would use the file system API
    showToast('Directory selection not implemented in demo', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Workspace Management
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage workspaces with custom preferences and settings
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Workspace
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            {isCreating ? 'Create New Workspace' : 'Edit Workspace'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Workspace name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Path *
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/path/to/workspace"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                />
                <button
                  onClick={selectDirectory}
                  className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-100 dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-400"
                >
                  <FolderIcon className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={isCreating ? handleCreate : () => handleUpdate(editingId!)}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isCreating ? 'Create' : 'Update'}
            </button>
          </div>
        </div>
      )}

      {/* Workspaces List */}
      <div className="space-y-4">
        {workspaces.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No workspaces configured. Create your first workspace to get started.
          </div>
        ) : (
          workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <FolderIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {workspace.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{workspace.path}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Created: {new Date(workspace.createdAt).toLocaleDateString()}
                    {workspace.updatedAt !== workspace.createdAt && (
                      <span className="ml-4">
                        Updated: {new Date(workspace.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(workspace)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(workspace.id, workspace.name)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Workspace Stats */}
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Projects:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">0</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Custom Preferences:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {Object.keys(workspace.preferences || {}).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkspaceManager;
