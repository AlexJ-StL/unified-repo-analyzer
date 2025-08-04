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
declare class BackupService {
    private backupInterval?;
    constructor();
    private initializeBackupSchedule;
    private ensureBackupDirectory;
    createBackup(): Promise<string>;
    private createBackupMetadata;
    private calculateChecksum;
    private createCompressedBackup;
    restoreBackup(backupPath: string): Promise<void>;
    listBackups(): Promise<BackupInfo[]>;
    private extractBackupMetadata;
    cleanupOldBackups(): Promise<void>;
    deleteBackup(filename: string): Promise<void>;
    private formatFileSize;
    getBackupStatus(): Promise<{
        enabled: boolean;
        lastBackup?: Date;
        nextBackup?: Date;
        backupCount: number;
        totalSize: string;
    }>;
    destroy(): void;
}
export declare const backupService: BackupService;
export default backupService;
