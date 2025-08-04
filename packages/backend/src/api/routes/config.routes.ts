/**
 * Configuration management API routes
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { configurationService } from '../../services/config.service';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/config/preferences
 * Get user preferences
 */
router.get('/preferences', async (_req, res) => {
  try {
    const preferences = await configurationService.getUserPreferences();
    res.json(preferences);
  } catch (error) {
    logger.error('Failed to get user preferences:', error);
    res.status(500).json({ error: 'Failed to get user preferences' });
  }
});

/**
 * PUT /api/config/preferences
 * Update user preferences
 */
router.put(
  '/preferences',
  body('general').optional().isObject(),
  body('analysis').optional().isObject(),
  body('llmProvider').optional().isObject(),
  body('export').optional().isObject(),
  body('ui').optional().isObject(),
  async (req, res) => {
    try {
      await configurationService.saveUserPreferences(req.body);
      const preferences = await configurationService.getUserPreferences();
      res.json(preferences);
    } catch (error) {
      logger.error('Failed to update user preferences:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Failed to update preferences' });
    }
  }
);

/**
 * PATCH /api/config/preferences/:section
 * Update specific preference section
 */
router.patch(
  '/preferences/:section',
  param('section').isIn(['general', 'analysis', 'llmProvider', 'export', 'ui']),
  async (req, res) => {
    try {
      const { section } = req.params;
      const preferences = await configurationService.updatePreferences(section as any, req.body);
      res.json(preferences);
    } catch (error) {
      logger.error(`Failed to update ${req.params.section} preferences:`, error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Failed to update preferences' });
    }
  }
);

/**
 * GET /api/config/presets
 * Get analysis mode presets
 */
router.get('/presets', (_req, res) => {
  try {
    const presets = configurationService.getAnalysisModePresets();
    res.json(presets);
  } catch (error) {
    logger.error('Failed to get analysis mode presets:', error);
    res.status(500).json({ error: 'Failed to get analysis mode presets' });
  }
});

/**
 * GET /api/config/workspaces
 * Get workspace configurations
 */
router.get('/workspaces', async (_req, res) => {
  try {
    const workspaces = await configurationService.getWorkspaceConfigurations();
    res.json(workspaces);
  } catch (error) {
    logger.error('Failed to get workspace configurations:', error);
    res.status(500).json({ error: 'Failed to get workspace configurations' });
  }
});

/**
 * POST /api/config/workspaces
 * Create workspace configuration
 */
router.post(
  '/workspaces',
  body('name').isString().notEmpty(),
  body('path').isString().notEmpty(),
  body('preferences').optional().isObject(),
  async (req, res) => {
    try {
      const workspace = await configurationService.saveWorkspaceConfiguration(req.body);
      res.status(201).json(workspace);
    } catch (error) {
      logger.error('Failed to create workspace configuration:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Failed to create workspace' });
    }
  }
);

/**
 * PUT /api/config/workspaces/:id
 * Update workspace configuration
 */
router.put(
  '/workspaces/:id',
  param('id').isUUID(),
  body('name').optional().isString().notEmpty(),
  body('path').optional().isString().notEmpty(),
  body('preferences').optional().isObject(),
  async (req, res) => {
    try {
      const workspace = await configurationService.updateWorkspaceConfiguration(
        req.params.id,
        req.body
      );
      res.json(workspace);
    } catch (error) {
      logger.error('Failed to update workspace configuration:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Failed to update workspace' });
    }
  }
);

/**
 * DELETE /api/config/workspaces/:id
 * Delete workspace configuration
 */
router.delete('/workspaces/:id', param('id').isUUID(), async (req, res) => {
  try {
    await configurationService.deleteWorkspaceConfiguration(req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete workspace configuration:', error);
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : 'Failed to delete workspace' });
  }
});

/**
 * GET /api/config/projects
 * Get project configurations
 */
router.get('/projects', async (_req, res) => {
  try {
    const projects = await configurationService.getProjectConfigurations();
    res.json(projects);
  } catch (error) {
    logger.error('Failed to get project configurations:', error);
    res.status(500).json({ error: 'Failed to get project configurations' });
  }
});

/**
 * POST /api/config/projects
 * Create project configuration
 */
router.post(
  '/projects',
  body('name').isString().notEmpty(),
  body('path').isString().notEmpty(),
  body('workspaceId').optional().isUUID(),
  body('preferences').optional().isObject(),
  body('customIgnorePatterns').optional().isArray(),
  body('customAnalysisOptions').optional().isObject(),
  async (req, res) => {
    try {
      const project = await configurationService.saveProjectConfiguration(req.body);
      res.status(201).json(project);
    } catch (error) {
      logger.error('Failed to create project configuration:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Failed to create project' });
    }
  }
);

/**
 * PUT /api/config/projects/:id
 * Update project configuration
 */
router.put('/projects/:id', param('id').isUUID(), async (req, res) => {
  try {
    const project = await configurationService.updateProjectConfiguration(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    logger.error('Failed to update project configuration:', error);
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : 'Failed to update project' });
  }
});

/**
 * DELETE /api/config/projects/:id
 * Delete project configuration
 */
router.delete('/projects/:id', param('id').isUUID(), async (req, res) => {
  try {
    await configurationService.deleteProjectConfiguration(req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete project configuration:', error);
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : 'Failed to delete project' });
  }
});

/**
 * GET /api/config/profiles
 * Get configuration profiles
 */
router.get('/profiles', async (_req, res) => {
  try {
    const profiles = await configurationService.getConfigurationProfiles();
    res.json(profiles);
  } catch (error) {
    logger.error('Failed to get configuration profiles:', error);
    res.status(500).json({ error: 'Failed to get configuration profiles' });
  }
});

/**
 * POST /api/config/profiles
 * Create configuration profile
 */
router.post(
  '/profiles',
  body('name').isString().notEmpty(),
  body('description').isString(),
  body('preferences').isObject(),
  body('isDefault').optional().isBoolean(),
  async (req, res) => {
    try {
      const profile = await configurationService.saveConfigurationProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      logger.error('Failed to create configuration profile:', error);
      res
        .status(400)
        .json({ error: error instanceof Error ? error.message : 'Failed to create profile' });
    }
  }
);

/**
 * POST /api/config/profiles/:id/apply
 * Apply configuration profile
 */
router.post('/profiles/:id/apply', param('id').isUUID(), async (req, res) => {
  try {
    const preferences = await configurationService.applyConfigurationProfile(req.params.id);
    res.json(preferences);
  } catch (error) {
    logger.error('Failed to apply configuration profile:', error);
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : 'Failed to apply profile' });
  }
});

/**
 * GET /api/config/effective-preferences
 * Get effective preferences for a project path
 */
router.get(
  '/effective-preferences',
  query('projectPath').isString().notEmpty(),
  async (req, res) => {
    try {
      const preferences = await configurationService.getEffectivePreferences(
        req.query.projectPath as string
      );
      res.json(preferences);
    } catch (error) {
      logger.error('Failed to get effective preferences:', error);
      res.status(500).json({ error: 'Failed to get effective preferences' });
    }
  }
);

/**
 * POST /api/config/validate
 * Validate configuration
 */
router.post('/validate', body('preferences').isObject(), async (req, res) => {
  try {
    const validation = configurationService.validateUserPreferences(req.body.preferences);
    res.json(validation);
  } catch (error) {
    logger.error('Failed to validate configuration:', error);
    res.status(500).json({ error: 'Failed to validate configuration' });
  }
});

/**
 * POST /api/config/reset
 * Reset to default preferences
 */
router.post('/reset', async (_req, res) => {
  try {
    const preferences = await configurationService.resetToDefaults();
    res.json(preferences);
  } catch (error) {
    logger.error('Failed to reset configuration:', error);
    res.status(500).json({ error: 'Failed to reset configuration' });
  }
});

/**
 * POST /api/config/backup
 * Create configuration backup
 */
router.post('/backup', async (_req, res) => {
  try {
    const backup = await configurationService.createBackup('manual');
    res.status(201).json(backup);
  } catch (error) {
    logger.error('Failed to create configuration backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

/**
 * POST /api/config/restore/:backupId
 * Restore configuration from backup
 */
router.post('/restore/:backupId', param('backupId').isUUID(), async (req, res) => {
  try {
    const preferences = await configurationService.restoreFromBackup(req.params.backupId);
    res.json(preferences);
  } catch (error) {
    logger.error('Failed to restore configuration:', error);
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : 'Failed to restore from backup' });
  }
});

/**
 * GET /api/config/export
 * Export configuration
 */
router.get('/export', async (_req, res) => {
  try {
    const configData = await configurationService.exportConfiguration();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="repo-analyzer-config.json"');
    res.send(configData);
  } catch (error) {
    logger.error('Failed to export configuration:', error);
    res.status(500).json({ error: 'Failed to export configuration' });
  }
});

/**
 * POST /api/config/import
 * Import configuration
 */
router.post('/import', body('configData').isString().notEmpty(), async (req, res) => {
  try {
    await configurationService.importConfiguration(req.body.configData);
    const preferences = await configurationService.getUserPreferences();
    res.json(preferences);
  } catch (error) {
    logger.error('Failed to import configuration:', error);
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : 'Failed to import configuration' });
  }
});

export default router;
