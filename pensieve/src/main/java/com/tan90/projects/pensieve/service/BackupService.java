package com.tan90.projects.pensieve.service;

import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);
    private static final long BACKUP_MAX_AGE_HOURS = 24;
    private static final DateTimeFormatter TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @Autowired(required = false)
    private Drive driveService;

    @Value("${backup.enabled:true}")
    private boolean backupEnabled;

    @Value("${backup.drive.folder-name}")
    private String driveFolderName;

    @Value("${backup.db.host}")
    private String dbHost;

    @Value("${backup.db.port}")
    private String dbPort;

    @Value("${backup.db.name}")
    private String dbName;

    @Value("${backup.db.user}")
    private String dbUser;

    @Value("${backup.db.password}")
    private String dbPassword;

    @Value("${backup.pg-dump-path}")
    private String pgDumpPath;

    public BackupService() {}

    @Scheduled(cron = "0 5 * * * *")
    public void runScheduledBackup() {
        if (!backupEnabled) {
            return;
        }
        if (driveService == null) {
            log.warn("Backup skipped: GOOGLE_DRIVE_REFRESH_TOKEN is not configured.");
            return;
        }
        try {
            performBackup(false);
        } catch (Exception e) {
            log.error("Scheduled backup failed", e);
        }
    }

    /**
     * Triggers a backup immediately, ignoring the 24-hour freshness check.
     * Throws on failure so the caller can return an appropriate HTTP response.
     */
    public String triggerBackup() throws Exception {
        if (driveService == null) {
            throw new IllegalStateException("Google Drive is not configured. Set the GOOGLE_DRIVE_REFRESH_TOKEN environment variable.");
        }
        return performBackup(true);
    }

    /**
     * Core backup logic.
     *
     * @param force when true, skips the 24-hour freshness check
     * @return a human-readable result message
     */
    private String performBackup(boolean force) throws Exception {
        log.info("Running backup (force={})...", force);

        java.io.File localDump = null;
        try {
            String folderId = getOrCreateBackupFolder();
            Optional<File> latestBackup = findLatestBackup(folderId);

            if (!force && !isBackupNeeded(latestBackup)) {
                log.info("Backup is fresh (less than {} hours old), skipping.", BACKUP_MAX_AGE_HOURS);
                return "Backup skipped: existing backup is less than " + BACKUP_MAX_AGE_HOURS + " hours old.";
            }

            log.info("Running pg_dump...");
            localDump = runPgDump();
            log.info("pg_dump complete: {}", localDump.getAbsolutePath());

            String uploadedFileId = uploadBackup(localDump, folderId);
            log.info("Backup uploaded to Drive with id: {}", uploadedFileId);

            deleteOldBackups(folderId, uploadedFileId);
            log.info("Old backups removed. Backup complete.");

            return "Backup completed successfully. Drive file id: " + uploadedFileId;

        } finally {
            deleteTempFile(localDump);
        }
    }

    private String getOrCreateBackupFolder() throws IOException {
        String query = String.format(
                "mimeType='application/vnd.google-apps.folder' AND name='%s' AND trashed=false",
                driveFolderName);

        FileList result = driveService.files().list()
                .setQ(query)
                .setSpaces("drive")
                .setFields("files(id, name)")
                .execute();

        if (result.getFiles() != null && !result.getFiles().isEmpty()) {
            return result.getFiles().get(0).getId();
        }

        File folderMetadata = new File()
                .setName(driveFolderName)
                .setMimeType("application/vnd.google-apps.folder");

        File created = driveService.files().create(folderMetadata)
                .setFields("id")
                .execute();

        log.info("Created Drive folder '{}' with id: {}", driveFolderName, created.getId());
        return created.getId();
    }

    private Optional<File> findLatestBackup(String folderId) throws IOException {
        String query = String.format(
                "'%s' in parents AND trashed=false AND mimeType!='application/vnd.google-apps.folder'",
                folderId);

        FileList result = driveService.files().list()
                .setQ(query)
                .setSpaces("drive")
                .setFields("files(id, name, createdTime)")
                .setOrderBy("createdTime desc")
                .setPageSize(1)
                .execute();

        List<File> files = result.getFiles();
        if (files == null || files.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(files.get(0));
    }

    private boolean isBackupNeeded(Optional<File> latestBackup) {
        if (latestBackup.isEmpty()) {
            return true;
        }
        long fileEpochMillis = latestBackup.get().getCreatedTime().getValue();
        long ageHours = Duration.between(Instant.ofEpochMilli(fileEpochMillis), Instant.now()).toHours();
        return ageHours >= BACKUP_MAX_AGE_HOURS;
    }

    private java.io.File runPgDump() throws IOException, InterruptedException {
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
        String fileName = "pensieve_backup_" + timestamp + ".dump";
        java.io.File outputFile = new java.io.File(System.getProperty("java.io.tmpdir"), fileName);

        List<String> command = List.of(
                pgDumpPath,
                "-h", dbHost,
                "-p", dbPort,
                "-U", dbUser,
                "-d", dbName,
                "-F", "c",
                "-f", outputFile.getAbsolutePath()
        );

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        Process process = pb.start();
        String output = new String(process.getInputStream().readAllBytes());
        boolean finished = process.waitFor(10, TimeUnit.MINUTES);

        if (!finished) {
            process.destroyForcibly();
            throw new IOException("pg_dump timed out after 10 minutes");
        }

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new IOException("pg_dump failed (exit " + exitCode + "): " + output);
        }

        return outputFile;
    }

    private String uploadBackup(java.io.File localFile, String folderId) throws IOException {
        File fileMetadata = new File()
                .setName(localFile.getName())
                .setParents(Collections.singletonList(folderId));

        FileContent mediaContent = new FileContent("application/octet-stream", localFile);

        File uploaded = driveService.files().create(fileMetadata, mediaContent)
                .setFields("id, name, createdTime")
                .execute();

        return uploaded.getId();
    }

    private void deleteOldBackups(String folderId, String keepFileId) throws IOException {
        String query = String.format(
                "'%s' in parents AND trashed=false AND mimeType!='application/vnd.google-apps.folder'",
                folderId);

        FileList result = driveService.files().list()
                .setQ(query)
                .setSpaces("drive")
                .setFields("files(id, name)")
                .execute();

        if (result.getFiles() == null) {
            return;
        }

        for (File file : result.getFiles()) {
            if (!file.getId().equals(keepFileId)) {
                driveService.files().delete(file.getId()).execute();
                log.info("Deleted old backup: {}", file.getName());
            }
        }
    }

    private void deleteTempFile(java.io.File file) {
        if (file != null && file.exists()) {
            boolean deleted = file.delete();
            if (!deleted) {
                log.warn("Could not delete temp file: {}", file.getAbsolutePath());
            }
        }
    }
}
