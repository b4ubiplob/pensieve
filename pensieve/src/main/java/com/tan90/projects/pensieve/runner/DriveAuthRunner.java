package com.tan90.projects.pensieve.runner;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.DriveScopes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * ONE-TIME SETUP UTILITY for obtaining a Google Drive refresh token.
 *
 * Steps:
 *   1. Enable the Google Drive API in Google Cloud Console for your OAuth2 project.
 *   2. Add your Google account as a test user in the OAuth consent screen.
 *   3. If your client type is "Web application", add http://localhost:8888/Callback
 *      to authorized redirect URIs in the Cloud Console.
 *   4. Set backup.enabled=false in application.yml (or via env var) for this run.
 *   5. Uncomment the @Component annotation below, then start the application.
 *   6. A browser window will open — approve Drive access.
 *   7. Copy the printed GOOGLE_DRIVE_REFRESH_TOKEN value and add it as a permanent env var.
 *   8. Re-comment @Component and set backup.enabled=true, then restart normally.
 */
//@Component  // Uncomment this line only for the one-time token setup run
public class DriveAuthRunner implements CommandLineRunner {

    @Value("${GOOGLE_CLIENT_ID}")
    private String clientId;

    @Value("${GOOGLE_CLIENT_SECRET}")
    private String clientSecret;

    @Override
    public void run(String... args) throws Exception {
        GoogleClientSecrets clientSecrets = new GoogleClientSecrets()
                .setInstalled(new GoogleClientSecrets.Details()
                        .setClientId(clientId)
                        .setClientSecret(clientSecret));

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                clientSecrets,
                Collections.singletonList(DriveScopes.DRIVE_FILE)
        )
        .setAccessType("offline")
        .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder()
                .setPort(8888)
                .build();

        Credential credential = new AuthorizationCodeInstalledApp(flow, receiver)
                .authorize("user");

        System.out.println("\n=== ONE-TIME SETUP OUTPUT ===");
        System.out.println("Add this to your environment:");
        System.out.println("GOOGLE_DRIVE_REFRESH_TOKEN=" + credential.getRefreshToken());
        System.out.println("=============================\n");

        System.exit(0);
    }
}
