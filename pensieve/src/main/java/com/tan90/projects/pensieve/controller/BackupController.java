package com.tan90.projects.pensieve.controller;

import com.tan90.projects.pensieve.service.BackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/backup")
@CrossOrigin(origins = "*")
public class BackupController {

    @Autowired
    private BackupService backupService;

    /**
     * POST /api/v1/backup/trigger
     * Immediately runs a database backup and uploads it to Google Drive,
     * bypassing the 24-hour freshness check.
     */
    @PostMapping("/trigger")
    public ResponseEntity<Map<String, String>> triggerBackup() {
        try {
            String message = backupService.triggerBackup();
            return ResponseEntity.ok(Map.of("status", "success", "message", message));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
