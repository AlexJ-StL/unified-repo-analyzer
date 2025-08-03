/**
 * Profile management component
 */
import React, { useEffect } from 'react';
import { PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToast } from '../../hooks/useToast';
const ProfileManager = () => {
    const { profiles, loadProfiles, applyProfile } = useSettingsStore();
    const { showToast } = useToast();
    useEffect(() => {
        loadProfiles();
    }, [loadProfiles]);
    const handleApplyProfile = async (profileId, profileName) => {
        try {
            await applyProfile(profileId);
            showToast(`Profile "${profileName}" applied successfully`, 'success');
        }
        catch {
            showToast('Failed to apply profile', 'error');
        }
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Configuration Profiles
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Save and apply different configuration presets
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2"/>
          New Profile
        </button>
      </div>

      <div className="space-y-4">
        {profiles.length === 0 ? (<div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No profiles saved. Create your first profile to get started.
          </div>) : (profiles.map((profile) => (<div key={profile.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400"/>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.description}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleApplyProfile(profile.id, profile.name)} className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900">
                  Apply
                </button>
              </div>
            </div>)))}
      </div>
    </div>);
};
export default ProfileManager;
//# sourceMappingURL=ProfileManager.js.map