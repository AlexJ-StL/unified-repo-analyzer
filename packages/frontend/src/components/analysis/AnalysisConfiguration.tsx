import type { OutputFormat } from "@unified-repo-analyzer/shared";
import type React from "react";
import { useEffect, useState } from "react";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useProviders } from "../../hooks/useProviders";
import { useToast } from "../../hooks/useToast";
import {
  type AnalysisOptions,
  useAnalysisStore,
} from "../../store/useAnalysisStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { validateAnalysisOptions } from "../../utils/validators";
import { ErrorBoundary, ErrorFallback, GracefulDegradation } from "../error";

interface AnalysisConfigurationProps {
  onConfigChange?: (options: AnalysisOptions) => void;
  className?: string;
}

const AnalysisConfiguration: React.FC<AnalysisConfigurationProps> = ({
  onConfigChange,
  className = "",
}) => {
  const { options, setOptions } = useAnalysisStore();
  const { preferences } = useSettingsStore();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [availableFormats] = useState<OutputFormat[]>([
    "json",
    "markdown",
    "html",
  ]);
  const [configError, setConfigError] = useState<Error | null>(null);

  const { handleError, handleAsyncError } = useErrorHandler();
  const { showSuccess, showWarning } = useToast();
  const {
    providers,
    loading: providersLoading,
    error: providersError,
    refreshProviders,
  } = useProviders();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch providers when component mounts
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        await refreshProviders();
      } catch (error) {
        handleError(error, "fetching providers");
        setConfigError(
          error instanceof Error
            ? error
            : new Error("Failed to fetch providers")
        );
      }
    };

    fetchProviders();
  }, [refreshProviders, handleError]);

  // Initialize with settings defaults if needed
  useEffect(() => {
    const initializeConfiguration = async () => {
      try {
        setIsLoading(true);
        setConfigError(null);

        if (!options.mode) {
          const defaultOptions = {
            mode: preferences.analysis?.defaultMode || "standard",
            llmProvider: preferences.llmProvider?.defaultProvider || "claude",
            outputFormats: ["json"] as OutputFormat[],
          };

          // Validate default options before setting
          const errors = validateAnalysisOptions({
            ...options,
            ...defaultOptions,
          });
          if (errors.length > 0) {
            showWarning(
              "Configuration Warning",
              "Some default settings are invalid and have been adjusted."
            );
          }

          setOptions(defaultOptions);

          if (onConfigChange) {
            onConfigChange({ ...options, ...defaultOptions });
          }
        }
      } catch (error) {
        handleError(error, "configuration initialization");
        setConfigError(
          error instanceof Error ? error : new Error("Configuration failed")
        );

        // Fallback to safe defaults
        const safeDefaults = {
          mode: "standard" as const,
          llmProvider: "claude",
          outputFormats: ["json"] as OutputFormat[],
          maxFiles: 100,
          maxLinesPerFile: 1000,
          includeLLMAnalysis: true,
          includeTree: true,
        };

        setOptions(safeDefaults);
        showWarning(
          "Configuration Error",
          "Using safe default settings due to configuration error."
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeConfiguration();
  }, [
    preferences,
    options,
    setOptions,
    onConfigChange,
    handleError,
    showWarning,
  ]);

  const handleModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await handleAsyncError(async () => {
      const mode = e.target.value as "quick" | "standard" | "comprehensive";

      // Adjust other options based on mode
      let updatedOptions: Partial<AnalysisOptions> = { mode };

      if (mode === "quick") {
        updatedOptions = {
          ...updatedOptions,
          maxFiles: 50,
          maxLinesPerFile: 500,
          includeLLMAnalysis: false,
        };
      } else if (mode === "standard") {
        updatedOptions = {
          ...updatedOptions,
          maxFiles: 100,
          maxLinesPerFile: 1000,
          includeLLMAnalysis: true,
        };
      } else if (mode === "comprehensive") {
        updatedOptions = {
          ...updatedOptions,
          maxFiles: 200,
          maxLinesPerFile: 2000,
          includeLLMAnalysis: true,
        };
      }

      const finalOptions = { ...options, ...updatedOptions };

      // Validate before applying
      const isValid = validateOptions(finalOptions);
      if (!isValid) {
        throw new Error("Invalid configuration options");
      }

      setOptions(updatedOptions);

      if (onConfigChange) {
        onConfigChange(finalOptions);
      }

      showSuccess("Configuration Updated", `Analysis mode changed to ${mode}`);
    }, "mode change");
  };

  const handleProviderChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    await handleAsyncError(async () => {
      const llmProvider = e.target.value;

      // Validate provider availability
      const provider = providers.find((p) => p.id === llmProvider);
      if (!provider) {
        throw new Error(`Provider "${llmProvider}" is not available`);
      }

      const finalOptions = { ...options, llmProvider };

      const isValid = validateOptions(finalOptions);
      if (!isValid) {
        throw new Error("Invalid provider configuration");
      }

      setOptions({ llmProvider });

      if (onConfigChange) {
        onConfigChange(finalOptions);
      }

      showSuccess("Provider Updated", `LLM provider changed to ${llmProvider}`);
    }, "provider change");
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (name === "includeTree") {
      setOptions({ includeTree: checked });

      if (onConfigChange) {
        onConfigChange({ ...options, includeTree: checked });
      }

      validateOptions({ ...options, includeTree: checked });
    } else if (name === "includeLLMAnalysis") {
      setOptions({ includeLLMAnalysis: checked });

      if (onConfigChange) {
        onConfigChange({ ...options, includeLLMAnalysis: checked });
      }

      validateOptions({ ...options, includeLLMAnalysis: checked });
    }
  };

  const handleFormatChange = (format: OutputFormat, checked: boolean) => {
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
    const numValue = Number.parseInt(value, 10);

    if (!Number.isNaN(numValue) && numValue > 0) {
      const update = { [name]: numValue } as Partial<AnalysisOptions>;
      setOptions(update);

      if (onConfigChange) {
        onConfigChange({ ...options, ...update });
      }

      validateOptions({ ...options, ...update });
    }
  };

  const validateOptions = (optionsToValidate: AnalysisOptions) => {
    try {
      const errors = validateAnalysisOptions(optionsToValidate);
      setValidationErrors(errors);

      if (errors.length > 0) {
        showWarning(
          "Configuration Issues",
          `Found ${errors.length} configuration issue${errors.length > 1 ? "s" : ""}`
        );
      }

      return errors.length === 0;
    } catch (error) {
      handleError(error, "options validation");
      setValidationErrors(["Validation failed - using previous settings"]);
      return false;
    }
  };

  const resetToDefaults = async () => {
    await handleAsyncError(async () => {
      const defaultOptions = {
        mode: "standard" as const,
        llmProvider: "claude",
        outputFormats: ["json"] as OutputFormat[],
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: true,
        includeTree: true,
      };

      setOptions(defaultOptions);
      setValidationErrors([]);
      setConfigError(null);

      if (onConfigChange) {
        onConfigChange({ ...options, ...defaultOptions });
      }

      showSuccess(
        "Configuration Reset",
        "Settings have been reset to defaults"
      );
    }, "reset to defaults");
  };

  const ConfigurationContent = () => (
    <div className={`analysis-configuration ${className}`}>
      {(isLoading || providersLoading) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Loading configuration...
            </span>
          </div>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Configuration Issues
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={`error-${index}-${error}`}>{error}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={resetToDefaults}
              className="ml-4 text-xs text-red-600 hover:text-red-800 underline"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      <div
        className="space-y-4"
        style={{ opacity: isLoading || providersLoading ? 0.6 : 1 }}
      >
        <div>
          <label
            htmlFor="analysis-mode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Analysis Mode
          </label>
          <select
            id="analysis-mode"
            name="mode"
            value={options.mode}
            onChange={handleModeChange}
            disabled={isLoading || providersLoading}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="quick">Quick - Basic structure analysis</option>
            <option value="standard">Standard - Balanced analysis</option>
            <option value="comprehensive">
              Comprehensive - Detailed analysis
            </option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {options.mode === "quick" &&
              "Fast analysis with minimal LLM usage, focusing on structure only."}
            {options.mode === "standard" &&
              "Balanced analysis with moderate LLM usage and code insights."}
            {options.mode === "comprehensive" &&
              "Detailed analysis with full LLM insights and comprehensive code review."}
          </p>
        </div>

        <GracefulDegradation
          feature="LLM Provider Selection"
          isEnabled={providers.length > 0}
          error={
            configError || providersError
              ? new Error(providersError || "Provider error")
              : null
          }
          onRetry={refreshProviders}
        >
          <div>
            <label
              htmlFor="llm-provider"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              LLM Provider
            </label>
            <select
              id="llm-provider"
              name="llmProvider"
              value={options.llmProvider}
              onChange={handleProviderChange}
              disabled={
                !options.includeLLMAnalysis || isLoading || providersLoading
              }
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
            >
              {providers
                .filter((provider) => provider.configured) // Only show configured providers
                .map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.displayName}
                    {provider.id === "openrouter" && " (Recommended)"}
                  </option>
                ))}
              {providers.length === 0 && (
                <option value="">No providers available</option>
              )}
            </select>
            {providersError && (
              <p className="mt-1 text-xs text-red-500">
                Error loading providers: {providersError}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {providers
                .filter((provider) => provider.configured)
                .map((provider) => (
                  <span
                    key={provider.id}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      provider.status === "active"
                        ? "bg-green-100 text-green-800"
                        : provider.status === "inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : provider.status === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {provider.displayName}
                    {provider.status === "active" && (
                      <svg
                        className="ml-1.5 h-2 w-2 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 8 8"
                      >
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    )}
                  </span>
                ))}
            </div>
          </div>
        </GracefulDegradation>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="max-files"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Max Files to Process
            </label>
            <input
              type="number"
              id="max-files"
              name="maxFiles"
              min="1"
              value={options.maxFiles}
              onChange={handleNumberChange}
              disabled={isLoading || providersLoading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="max-lines"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Max Lines Per File
            </label>
            <input
              type="number"
              id="max-lines"
              name="maxLinesPerFile"
              min="1"
              value={options.maxLinesPerFile}
              onChange={handleNumberChange}
              disabled={isLoading || providersLoading}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Output Formats
          </legend>
          <div className="space-x-4 flex items-center">
            {availableFormats.map((format) => (
              <label key={format} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={options.outputFormats.includes(format)}
                  onChange={(e) => handleFormatChange(format, e.target.checked)}
                  disabled={isLoading || providersLoading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {format.charAt(0).toUpperCase() + format.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="include-llm"
              name="includeLLMAnalysis"
              type="checkbox"
              checked={options.includeLLMAnalysis}
              onChange={handleCheckboxChange}
              disabled={isLoading || providersLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label
              htmlFor="include-llm"
              className="ml-2 block text-sm text-gray-700"
            >
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
              disabled={isLoading || providersLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label
              htmlFor="include-tree"
              className="ml-2 block text-sm text-gray-700"
            >
              Include File Tree in Output
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          title="Configuration Error"
          message="The analysis configuration component encountered an error."
          showRetry={true}
          showDetails={true}
          error={new Error("Configuration component error")}
        />
      }
    >
      <ConfigurationContent />
    </ErrorBoundary>
  );
};

export default AnalysisConfiguration;
