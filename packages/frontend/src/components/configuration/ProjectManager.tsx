/**
 * Project management component
 */

import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToast } from '../../hooks/useToast';

const ProjectManager: React.FC = () => {
  const { projects, workspaces, loadProjects, createProject, updateProject, deleteProject } =
    useSettingsStore();
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage individual projects with custom analysis settings
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No projects configured. Create your first project to get started.
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RectangleStackIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.path}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
