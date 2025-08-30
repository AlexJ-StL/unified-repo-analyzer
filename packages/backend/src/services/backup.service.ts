import fs from "node:fs";
import path from "node:path";
import { env } from "../config/environment";
import logger from "./logger.service";

interface BackupMetadata {
  timestamp: Date;
  version: string;
  dataSize: number;
  indexSize: number;
  cacheSize: number;
  checksum: string;
}

interface BackupInfo {
  filename: string;
  metadata: BackupMetadata;
  size: number;
  created: Date;
}

class BackupService {
  private backupInterval?: NodeJS.Timeout;

  constructor() {
    if (env.BACKUP_ENABLED) {
      this.initializeBackupSchedule();
    }
  }

  private initializeBackupSchedule(): void {
    // Ensure backup directory exists
    this.ensureBackupDirectory();

    // Schedule periodic backups
    this.backupInterval = setInterval(async () => {
      try {
        await this.createBackup();
        await this.cleanupOldBackups();
      } catch (error) {
        logger.error(
          "Scheduled backup failed",
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }, env.BACKUP_INTERVAL);

    logger.info("Backup service initialized", {
      interval: `${env.BACKUP_INTERVAL / 1000 / 60} minutes`,
      retention: `${env.BACKUP_RETENTION_DAYS} days`,
    });
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(env.BACKUP_DIR)) {
      fs.mkdirSync(env.BACKUP_DIR, { recursive: true });
    }
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilename = `backup-${timestamp}.tar.gz`;
    const backupPath = path.join(env.BACKUP_DIR, backupFilename);

    logger.info("Starting backup creation", { filename: backupFilename });

    try {
      // Create backup metadata
      const metadata = await this.createBackupMetadata();

      // Create compressed backup
      await this.createCompressedBackup(backupPath, metadata);

      logger.info("Backup created successfully", {
        filename: backupFilename,
        size: this.formatFileSize(fs.statSync(backupPath).size),
      });

      return backupPath;
    } catch (error) {
      logger.error(
        "Backup creation failed",
        error instanceof Error ? error : new Error(String(error)),
        {
          filename: backupFilename,
        }
      );
      throw error;
    }
  }

  private async createBackupMetadata(): Promise<BackupMetadata> {
    const getDirectorySize = async (dirPath: string): Promise<number> => {
      if (!fs.existsSync(dirPath)) return 0;

      let totalSize = 0;
      const files = await fs.promises.readdir(dirPath, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          totalSize += await getDirectorySize(filePath);
        } else {
          const stats = await fs.promises.stat(filePath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    };

    const [dataSize, indexSize, cacheSize] = await Promise.all([
      getDirectorySize(env.DATA_DIR),
      getDirectorySize(env.INDEX_DIR),
      getDirectorySize(env.CACHE_DIR),
    ]);

    return {
      timestamp: new Date(),
      version: process.env.npm_package_version || "1.0.0",
      dataSize,
      indexSize,
      cacheSize,
      checksum: await this.calculateChecksum(),
    };
  }

  private async calculateChecksum(): Promise<string> {
    // Simple checksum based on directory modification times
    const crypto = await import("node:crypto");
    const hash = crypto.createHash("sha256");

    const addDirectoryToHash = async (dirPath: string) => {
      if (!fs.existsSync(dirPath)) return;

      const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          await addDirectoryToHash(filePath);
        } else {
          const stats = await fs.promises.stat(filePath);
          hash.update(`${filePath}:${stats.mtime.getTime()}:${stats.size}`);
        }
      }
    };

    await addDirectoryToHash(env.DATA_DIR);
    await addDirectoryToHash(env.INDEX_DIR);
    await addDirectoryToHash(env.CACHE_DIR);

    return hash.digest("hex");
  }

  private async createCompressedBackup(
    backupPath: string,
    metadata: BackupMetadata
  ): Promise<void> {
    const tar = await import("tar");

    // Create temporary directory for backup staging
    const tempDir = path.join(env.BACKUP_DIR, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      // Write metadata file
      const metadataPath = path.join(tempDir, "metadata.json");
      await fs.promises.writeFile(
        metadataPath,
        JSON.stringify(metadata, null, 2)
      );

      // Create tar archive with compression
      const filesToBackup = [
        { src: env.DATA_DIR, dest: "data" },
        { src: env.INDEX_DIR, dest: "index" },
        { src: env.CACHE_DIR, dest: "cache" },
        { src: metadataPath, dest: "metadata.json" },
      ];

      const validFiles = filesToBackup.filter((file) =>
        fs.existsSync(file.src)
      );

      await tar.create(
        {
          gzip: true,
          file: backupPath,
          cwd: path.dirname(env.DATA_DIR),
        },
        validFiles.map((file) =>
          path.relative(path.dirname(env.DATA_DIR), file.src)
        )
      );
    } finally {
      // Clean up temporary directory
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    }
  }

  async restoreBackup(backupPath: string): Promise<void> {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    logger.info("Starting backup restoration", { backupPath });

    try {
      const tar = await import("tar");

      // Create backup of current data before restoration
      const currentBackupPath = await this.createBackup();
      logger.info("Current data backed up before restoration", {
        currentBackupPath,
      });

      // Extract backup
      await tar.extract({
        file: backupPath,
        cwd: path.dirname(env.DATA_DIR),
      });

      // Verify restoration
      const metadataPath = path.join(
        path.dirname(env.DATA_DIR),
        "metadata.json"
      );
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(
          await fs.promises.readFile(metadataPath, "utf-8")
        );
        logger.info("Backup restored successfully", {
          originalTimestamp: metadata.timestamp,
          version: metadata.version,
        });

        // Clean up metadata file
        await fs.promises.unlink(metadataPath);
      }
    } catch (error) {
      logger.error(
        "Backup restoration failed",
        error instanceof Error ? error : new Error(String(error)),
        {
          backupPath,
        }
      );
      throw error;
    }
  }

  async listBackups(): Promise<BackupInfo[]> {
    this.ensureBackupDirectory();

    const files = await fs.promises.readdir(env.BACKUP_DIR);
    const backupFiles = files.filter(
      (file) => file.startsWith("backup-") && file.endsWith(".tar.gz")
    );

    const backups: BackupInfo[] = [];

    for (const filename of backupFiles) {
      const filePath = path.join(env.BACKUP_DIR, filename);
      const stats = await fs.promises.stat(filePath);

      try {
        const metadata = await this.extractBackupMetadata(filePath);
        backups.push({
          filename,
          metadata,
          size: stats.size,
          created: stats.birthtime,
        });
      } catch (error) {
        logger.warn("Failed to read backup metadata", { filename, error });
        // Add backup without metadata
        backups.push({
          filename,
          metadata: {
            timestamp: stats.birthtime,
            version: "unknown",
            dataSize: 0,
            indexSize: 0,
            cacheSize: 0,
            checksum: "",
          },
          size: stats.size,
          created: stats.birthtime,
        });
      }
    }

    return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  private async extractBackupMetadata(
    backupPath: string
  ): Promise<BackupMetadata> {
    const tar = await import("tar");

    return new Promise((resolve, reject) => {
      tar
        .list({
          file: backupPath,
          onentry: (entry) => {
            if (entry.path === "metadata.json") {
              let data = "";
              entry.on("data", (chunk) => {
                data += chunk.toString();
              });
              entry.on("end", () => {
                try {
                  const metadata = JSON.parse(data);
                  resolve(metadata);
                } catch (error) {
                  reject(error);
                }
              });
            }
          },
        })
        .catch(reject);
    });
  }

  async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - env.BACKUP_RETENTION_DAYS);

    const oldBackups = backups.filter((backup) => backup.created < cutoffDate);

    for (const backup of oldBackups) {
      const backupPath = path.join(env.BACKUP_DIR, backup.filename);
      try {
        await fs.promises.unlink(backupPath);
        logger.info("Old backup deleted", { filename: backup.filename });
      } catch (error) {
        logger.warn("Failed to delete old backup", {
          filename: backup.filename,
          error:
            error instanceof Error
              ? { message: error.message, stack: error.stack, name: error.name }
              : { message: String(error) },
        });
      }
    }

    if (oldBackups.length > 0) {
      logger.info("Backup cleanup completed", {
        deletedCount: oldBackups.length,
      });
    }
  }

  async deleteBackup(filename: string): Promise<void> {
    const backupPath = path.join(env.BACKUP_DIR, filename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }

    await fs.promises.unlink(backupPath);
    logger.info("Backup deleted", { filename });
  }

  private formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  async getBackupStatus(): Promise<{
    enabled: boolean;
    lastBackup?: Date;
    nextBackup?: Date;
    backupCount: number;
    totalSize: string;
  }> {
    const backups = await this.listBackups();
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);

    let nextBackup: Date | undefined;
    if (env.BACKUP_ENABLED && this.backupInterval) {
      nextBackup = new Date(Date.now() + env.BACKUP_INTERVAL);
    }

    return {
      enabled: env.BACKUP_ENABLED,
      lastBackup: backups.length > 0 ? backups[0].created : undefined,
      nextBackup,
      backupCount: backups.length,
      totalSize: this.formatFileSize(totalSize),
    };
  }

  destroy(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = undefined;
    }
  }
}

export const backupService = new BackupService();
export default backupService;
