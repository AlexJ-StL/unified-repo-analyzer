import React, { useState, useEffect } from 'react';
import { useAnalysisStore, AnalysisOptions } from '../../store/useAnalysisStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { validateAnalysisOptions } from '../../utils/validators';

interface AnalysisConfigurationProps {
  onConfigChange?: (options: AnalysisOptions) => void;
  className?: string;
}

const AnalysisConfiguration: React.FC<AnalysisConfigurationProps> = ({
  onConfigChange,
  className = '',
}) => {
  const { options, setOptions } = useAnalysisStore();
  const { settings } = useSettingsStore();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [availableProviders] = useState<string[]>(['claude', 'gemini', 'mock']);
  const [availableFormats] = useState<string[]>(['json', 'markdown', 'html']);

  // Initialize with settings defaults if needed
  useEffect(() => {
    if (!options.mode) {
      setOptions({
        mode: settings.general.defaultAnalysisMode,
        llmProvider: settings.llmProvider.defaultProvider,
        outputFormats: [settings.general.defaultExportFormat],
      });
    }
  }, [settings, options, setOptions]);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as 'quick' | 'standard' | 'comprehensive';

    // Adjust other options based on mode
    let updatedOptions: Partial<AnalysisOptions> = { mode };

    if (mode === 'quick') {
      updatedOptions = {
        ...updatedOptions,
        maxFiles: 50,
        maxLinesPerFile: 500,
        includeLLMAnalysis: false,
      };
    } else if (mode === 'standard') {
      updatedOptions = {
        ...updatedOptions,
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: true,
      };
    } else if (mode === 'comprehensive') {
      updatedOptions = {
        ...updatedOptions,
        maxFiles: 200,
        maxLinesPerFile: 2000,
        includeLLMAnalysis: true,
      };
    }

    setOptions(updatedOptions);

    if (onConfigChange) {
      onConfigChange({ ...options, ...updatedOptions });
    }

    validateOptions({ ...options, ...updatedOptions });
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const llmProvider = e.target.value;
    setOptions({ llmProvider });

    if (onConfigChange) {
      onConfigChange({ ...options, llmProvider });
    }

    validateOptions({ ...options, llmProvider });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (name === 'includeTree') {
      setOptions({ includeTree: checked });

      if (onConfigChange) {
        onConfigChange({ ...options, includeTree: checked });
      }

      validateOptions({ ...options, includeTree: checked });
    } else if (name === 'includeLLMAnalysis') {
      setOptions({ includeLLMAnalysis: checked });

      if (onConfigChange) {
        onConfigChange({ ...options, includeLLMAnalysis: checked });
      }

      validateOptions({ ...options, includeLLMAnalysis: checked });
    }
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    let updatedFormats = [...options.outputFormats];

    if (checked && !updatedFormats.includes(format)) {
      updatedFormats.push(format);
    } else if (!checked && updatedFormats.includes(format)) {
      updatedFormats = updatedFormats.filter((f) => f !== format);
    }

    setOptions({ outputFormats: updatedFormats });

    if (onConfigChange) {
      onConfigChange({ ...options, outputFormats: updatedFormats });
    }

    validateOptions({ ...options, outputFormats: updatedFormats });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);

    if (!isNaN(numValue) && numValue > 0) {
      const update = { [name]: numValue } as Partial<AnalysisOptions>;
      setOptions(update);

      if (onConfigChange) {
        onConfigChange({ ...options, ...update });
      }

      validateOptions({ ...options, ...update });
    }
  };

  const validateOptions = (optionsToValidate: AnalysisOptions) => {
    const errors = validateAnalysisOptions(optionsToValidate);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  return (
    <div className={`analysis-configuration ${className}`}>
      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800">Configuration Errors</h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="analysis-mode" className="block text-sm font-medium text-gray-700 mb-1">
            Analysis Mode
          </label>
          <select
            id="analysis-mode"
            name="mode"
            value={options.mode}
            onChange={handleModeChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="quick">Quick - Basic structure analysis</option>
            <option value="standard">Standard - Balanced analysis</option>
            <option value="comprehensive">Comprehensive - Detailed analysis</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {options.mode === 'quick' &&
              'Fast analysis with minimal LLM usage, focusing on structure only.'}
            {options.mode === 'standard' &&
              'Balanced analysis with moderate LLM usage and code insights.'}
            {options.mode === 'comprehensive' &&
              'Detailed analysis with full LLM insights and comprehensive code review.'}
          </p>
        </div>

        <div>
          <label htmlFor="llm-provider" className="block text-sm font-medium text-gray-700 mb-1">
            LLM Provider
          </label>
          <select
            id="llm-provider"
            name="llmProvider"
            value={options.llmProvider}
            onChange={handleProviderChange}
            disabled={!options.includeLLMAnalysis}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
          >
            {availableProviders.map((provider) => (
              <option key={provider} value={provider}>
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="max-files" className="block text-sm font-medium text-gray-700 mb-1">
              Max Files to Process
            </label>
            <input
              type="number"
              id="max-files"
              name="maxFiles"
              min="1"
              value={options.maxFiles}
              onChange={handleNumberChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="max-lines" className="block text-sm font-medium text-gray-700 mb-1">
              Max Lines Per File
            </label>
            <input
              type="number"
              id="max-lines"
              name="maxLinesPerFile"
              min="1"
              value={options.maxLinesPerFile}
              onChange={handleNumberChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Output Formats</label>
          <div className="space-x-4 flex items-center">
            {availableFormats.map((format) => (
              <label key={format} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={options.outputFormats.includes(format)}
                  onChange={(e) => handleFormatChange(format, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="include-llm"
              name="includeLLMAnalysis"
              type="checkbox"
              checked={options.includeLLMAnalysis}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="include-llm" className="ml-2 block text-sm text-gray-700">
              Include LLM Analysis
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="include-tree"
              name="includeTree"
              type="checkbox"
              checked={options.includeTree}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="include-tree" className="ml-2 block text-sm text-gray-700">
              Include File Tree in Output
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisConfiguration;
