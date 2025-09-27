/**
 * Main configuration management component
 */

import { Tab } from '@headlessui/react';
import {
  CogIcon,
  DocumentArrowDownIcon,
  FolderIcon,
  PaintBrushIcon,
  RectangleStackIcon,
  ServerIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useSettingsStore } from '../../store/useSettingsStore';
import AnalysisPreferences from './AnalysisPreferences';
import ConfigurationImportExport from './ConfigurationImportExport';
import ExportPreferences from './ExportPreferences';
import GeneralPreferences from './GeneralPreferences';
import LLMProviderPreferences from './LLMProviderPreferences';
import ProfileManager from './ProfileManager';
import ProjectManager from './ProjectManager';
import UIPreferences from './UIPreferences';
import WorkspaceManager from './WorkspaceManager';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ConfigurationManager: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    isLoading,
    error,
    loadPreferences,
    loadWorkspaces,
    loadProjects,
    loadProfiles,
    loadPresets,
    clearError,
  } = useSettingsStore();
  const { showToast } = useToast();

  const tabs = [
    { name: 'General', icon: UserIcon, component: GeneralPreferences },
    { name: 'Analysis', icon: CogIcon, component: AnalysisPreferences },
    {
      name: 'LLM Providers',
      icon: ServerIcon,
      component: LLMProviderPreferences,
    },
    {
      name: 'Export',
      icon: DocumentArrowDownIcon,
      component: ExportPreferences,
    },
    { name: 'UI', icon: PaintBrushIcon, component: UIPreferences },
    { name: 'Workspaces', icon: FolderIcon, component: WorkspaceManager },
    { name: 'Projects', icon: RectangleStackIcon, component: ProjectManager },
    { name: 'Profiles', icon: UserIcon, component: ProfileManager },
    {
      name: 'Import/Export',
      icon: DocumentArrowDownIcon,
      component: ConfigurationImportExport,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadPreferences(),
        loadWorkspaces(),
        loadProjects(),
        loadProfiles(),
        loadPresets(),
      ]);
    };
    loadData();
  }, [loadPreferences, loadWorkspaces, loadProjects, loadProfiles, loadPresets]);

  useEffect(() => {
    if (error) {
      showToast({ type: 'error', title: error });
      clearError();
    }
  }, [error, showToast, clearError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuration</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your preferences, workspaces, and analysis settings
        </p>
      </div>

      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Tab.List className="flex flex-col space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow p-2">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      selected
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                    )
                  }
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
          </div>

          {/* Content */}
          <div className="flex-1">
            <Tab.Panels>
              {tabs.map((tab, _index) => (
                <Tab.Panel key={tab.id || tab.name} className="focus:outline-none">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <tab.component />
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </div>
        </div>
      </Tab.Group>
    </div>
  );
};

export default ConfigurationManager;
